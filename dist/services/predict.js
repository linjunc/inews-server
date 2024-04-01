"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedArticle = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const user_1 = __importDefault(require("../model/user"));
const article_1 = __importDefault(require("../model/article"));
const constant_tag_name_1 = require("../utils/constant_tag_name");
// 创建一个标签到索引的映射
const labelToIndex = constant_tag_name_1.TAG_CONST.reduce((acc, label, index) => (Object.assign(Object.assign({}, acc), { [label]: index })), {});
// 创建一个函数将标签转换为one-hot向量
function labelToOneHot(label) {
    const vector = Array(constant_tag_name_1.TAG_CONST.length).fill(0);
    vector[labelToIndex[label]] = 1;
    return vector;
}
class Recommender {
    constructor(labels) {
        this.labels = labels;
        this.model = this.createModel();
        this.model.compile({
            optimizer: "adam",
            loss: "categoricalCrossentropy",
            metrics: ["accuracy"],
        });
    }
    static getInstance(labels = constant_tag_name_1.TAG_CONST) {
        if (!Recommender.instance) {
            Recommender.instance = new Recommender(labels);
        }
        return Recommender.instance;
    }
    // 创建模型
    // 创建模型
    createModel() {
        const model = tf.sequential();
        model.add(tf.layers.dense({
            inputShape: [constant_tag_name_1.TAG_CONST.length],
            units: 5,
            activation: "relu",
        }));
        model.add(tf.layers.dense({ units: constant_tag_name_1.TAG_CONST.length, activation: "softmax" }));
        return model;
    }
    // 训练
    train(articleFeatures, userPreferences) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("articleFeatures", articleFeatures, "userPreferences", userPreferences);
            const input = tf.tensor2d(articleFeatures);
            const output = tf.tensor2d(userPreferences);
            yield this.model.fit(input, output, {
                epochs: 100,
                batchSize: 5,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
                    },
                },
            });
        });
    }
    recommendForUser(articleFeatures) {
        const input = tf.tensor2d(articleFeatures);
        const prediction = this.model.predict(input).arraySync();
        let recommendedTags = prediction.map((value, index) => ({
            label: this.labels[index],
            score: value[index],
        }));
        recommendedTags.sort((a, b) => b.score - a.score);
        return recommendedTags;
    }
    // 归一化
    getUserData(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.default.findOne({ _id: userId });
                if (!user)
                    return { articleTags: [], labelFeatures: [], userPreferences: [] };
                // 合并用户的阅读记录、点赞记录和收藏记录
                const userArticleIds = Array.from(new Set([
                    ...user.history_id_list,
                    ...user.digg_article_id_list,
                    ...user.like_article_id_list,
                ]));
                const articles = yield article_1.default.find({
                    _id: { $in: userArticleIds },
                });
                const articleLabels = articles.map((i) => i.tag);
                // 为每个用户和每个标签创建一个样本
                const userLabelFeatures = articleLabels.map(labelToOneHot);
                // 对于每个标签，如果用户有过正反馈行为，则喜好为1，否则为0
                const userPreferences = articleLabels.map((articleLabel) => labelToOneHot(articleLabel));
                return {
                    articleTags: articleLabels,
                    labelFeatures: userLabelFeatures,
                    userPreferences,
                };
            }
            finally {
            }
        });
    }
}
const getRecommendedArticle = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const recommender = Recommender.getInstance();
    const { labelFeatures, userPreferences } = yield recommender.getUserData(userId);
    yield recommender.train(labelFeatures, userPreferences);
    const recommendedArticles = recommender.recommendForUser(labelFeatures);
    console.log(`为用户 ${userId} 推荐的文章：`);
    console.log(recommendedArticles);
    return recommendedArticles;
});
exports.getRecommendedArticle = getRecommendedArticle;
