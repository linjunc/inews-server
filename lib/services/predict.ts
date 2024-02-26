import { MongoClient } from "mongodb";
import * as tf from "@tensorflow/tfjs-node";
import userModel from "../model/user";
import articleModel from "../model/article";

class Recommender {
  private static instance: Recommender;
  private articles: number[];
  private model: tf.LayersModel;

  private constructor(articles: number[]) {
    this.articles = articles;
    this.model = this.createModel();
    this.model.compile({
      optimizer: "adam",
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });
  }

  public static getInstance(articles: number[]): Recommender {
    if (!Recommender.instance) {
      Recommender.instance = new Recommender(articles);
    }
    return Recommender.instance;
  }

  // 创建模型
  private createModel(): tf.LayersModel {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        inputShape: [this.articles.length],
        units: 5,
        activation: "relu",
      })
    );
    model.add(
      tf.layers.dense({ units: this.articles.length, activation: "softmax" })
    );
    return model;
  }

  // 训练
  public async train(userArticleMatrix: number[][]): Promise<void> {
    const input = tf.tensor2d(userArticleMatrix);
    const output = tf.tensor2d(userArticleMatrix);

    await this.model.fit(input, output, {
      epochs: 100,
      batchSize: 5,
      callbacks: {
        onEpochEnd: (epoch, logs: any) => {
          console.log(
            `Epoch ${epoch}: loss = ${logs.loss as number}, accuracy = ${
              logs.acc as number
            }`
          );
        },
      },
    });
  }

  public recommendForUser(
    userArticleMatrix: number[][],
    userIndex: number
  ): { article: number; score: number }[] {
    const input = tf.tensor2d([userArticleMatrix[userIndex]]);
    const prediction = (
      (this.model.predict(input) as tf.Tensor).arraySync() as number[][]
    )[0];

    let recommendedArticles = this.articles.map((article, index) => ({
      article,
      score: prediction[index],
    }));

    recommendedArticles.sort((a, b) => b.score - a.score);

    return recommendedArticles;
  }
}

// 归一化
async function getArticlesAndUserData(userId: any): Promise<{
  articles: number[];
  userArticleMatrix: number[][];
  userIndex: any;
}> {
  try {
    const articles = await articleModel.find();

    const articlesIds = articles.map((i) => i._id);

    const users = await userModel.find();
    let userIndex = null;

    const userArticleMatrix = users.map((user, index) => {
      if (user._id.toString() === userId) userIndex = index;
      console.log(user.digg_article_id_list);
      const likedArticles = new Set(user.digg_article_id_list);
      return articles.map((article) => (likedArticles.has(article) ? 1 : 0));
    });

    return { articles: articlesIds, userArticleMatrix, userIndex };
  } finally {
  }
}

export const getRecommendedArticle = async (userId: string) => {
  const { articles, userArticleMatrix, userIndex } =
    await getArticlesAndUserData(userId);

  if (!userIndex) {
    return null;
  }

  const recommender = Recommender.getInstance(articles);
  await recommender.train(userArticleMatrix);

  const recommendedArticles = recommender.recommendForUser(
    userArticleMatrix,
    userIndex
  );

  console.log(`为用户 ${userId} 推荐的文章：`);
  console.log(recommendedArticles);
  return recommendedArticles;
};
