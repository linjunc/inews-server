import * as tf from "@tensorflow/tfjs-node";
import userModel from "../model/user";
import articleModel from "../model/article";
import { TAG_CONST } from "../utils/constant_tag_name";

// 创建一个标签到索引的映射
const labelToIndex = TAG_CONST.reduce(
  (acc, label, index) => ({ ...acc, [label]: index }),
  {} as any
);

// 创建一个函数将标签转换为one-hot向量
function labelToOneHot(label: string) {
  const vector = Array(TAG_CONST.length).fill(0);
  vector[labelToIndex[label]] = 1;
  return vector;
}

class Recommender {
  private static instance: Recommender;
  private labels: typeof TAG_CONST;
  private model: tf.LayersModel;

  private constructor(labels: typeof TAG_CONST) {
    this.labels = labels;
    this.model = this.createModel();
    this.model.compile({
      optimizer: "adam",
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });
  }

  public static getInstance(labels = TAG_CONST): Recommender {
    if (!Recommender.instance) {
      Recommender.instance = new Recommender(labels);
    }
    return Recommender.instance;
  }

  // 创建模型
  // 创建模型
  private createModel(): tf.LayersModel {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        inputShape: [TAG_CONST.length],
        units: 5,
        activation: "relu",
      })
    );
    model.add(
      tf.layers.dense({ units: TAG_CONST.length, activation: "softmax" })
    );
    return model;
  }

  // 训练
  public async train(
    articleFeatures: number[][],
    userPreferences: number[][]
  ): Promise<void> {
    console.log(
      "articleFeatures",
      articleFeatures,
      "userPreferences",
      userPreferences
    );
    const input = tf.tensor2d(articleFeatures);
    const output = tf.tensor2d(userPreferences);

    await this.model.fit(input, output, {
      epochs: 100,
      batchSize: 5,
      callbacks: {
        onEpochEnd: (epoch, logs: any) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss as number}`);
        },
      },
    });
  }

  public recommendForUser(
    articleFeatures: number[][]
  ): { label: string; score: number }[] {
    const input = tf.tensor2d(articleFeatures);

    const prediction = (
      this.model.predict(input) as tf.Tensor
    ).arraySync() as number[][];

    let recommendedTags = prediction.map((value, index) => ({
      label: this.labels[index],
      score: value[index],
    }));

    recommendedTags.sort((a, b) => b.score - a.score);

    return recommendedTags;
  }

  // 归一化
  async getUserData(userId: any): Promise<{
    labelFeatures: number[][];
    userPreferences: number[][];
    articleTags: string[];
  }> {
    try {
      const user = await userModel.findOne({ _id: userId });

      if (!user)
        return { articleTags: [], labelFeatures: [], userPreferences: [] };
      // 合并用户的阅读记录、点赞记录和收藏记录
      const userArticleIds = Array.from(
        new Set([
          ...user.history_id_list,
          ...user.digg_article_id_list,
          ...user.like_article_id_list,
        ])
      );

      const articles = await articleModel.find({
        _id: { $in: userArticleIds },
      });

      const articleLabels = articles.map((i) => i.tag);

      // 为每个用户和每个标签创建一个样本
      const userLabelFeatures = articleLabels.map(labelToOneHot);

      // 对于每个标签，如果用户有过正反馈行为，则喜好为1，否则为0
      const userPreferences = articleLabels.map((articleLabel) =>
        labelToOneHot(articleLabel)
      );

      return {
        articleTags: articleLabels,
        labelFeatures: userLabelFeatures,
        userPreferences,
      };
    } finally {
    }
  }
}

export const getRecommendedArticle = async (userId: string) => {
  const recommender = Recommender.getInstance();
  const { labelFeatures, userPreferences } = await recommender.getUserData(
    userId
  );

  await recommender.train(labelFeatures, userPreferences);

  const recommendedArticles = recommender.recommendForUser(labelFeatures);

  console.log(`为用户 ${userId} 推荐的文章：`);
  console.log(recommendedArticles);
  return recommendedArticles;
};
