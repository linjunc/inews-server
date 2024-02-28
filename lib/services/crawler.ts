import axios from "axios";

import userModel from "../model/user";
import articleModel from "../model/article";
import commentModel from "../model/comment";
import { picReChange } from "../utils/picReChange";
import { TAG_CONST } from "../utils/constant_tag_name";
import { transferImage, transferImages } from "../services/transfer";
import replyModel from "../model/reply";

const getComment = (articleId: string) => {
  return axios.get(
    `https://is-hl.snssdk.com/article/v4/tab_comments/?group_id=${articleId}&item_id=${articleId}&aggr_type=1&count=20&offset=0&tab_index=0&fold=1&iid=53137311418&device_id=57714824519&ac=wifi&channel=samsungapps&aid=13&app_name=news_article&version_code=701&version_name=7.0.1&device_platform=android&ab_version=611287%2C650250%2C486953%2C647938%2C648204%2C642200%2C452159%2C571131%2C641920%2C639003%2C239098%2C612192%2C641906%2C170988%2C643890%2C642339%2C594604%2C374118%2C641855%2C642664%2C644565%2C648685%2C633720%2C613177%2C550042%2C435213%2C603543%2C586998%2C609623%2C642975%2C627128%2C649426%2C614097%2C522766%2C648762%2C416055%2C621360%2C646597%2C639580%2C643097%2C630238%2C558139%2C555254%2C640008%2C635503%2C603442%2C596392%2C550818%2C630577%2C598626%2C644845%2C634911%2C646253%2C603386%2C603399%2C603404%2C603405%2C642681%2C649811%2C646564%2C648850%2C629152%2C607361%2C471797%2C609338%2C326532%2C631168%2C641414%2C646381%2C637865%2C644620%2C638168%2C648057%2C631389%2C644945%2C622716%2C644036%2C622132%2C622993%2C649184%2C640997%2C641075%2C643790%2C631607%2C633139%2C643839%2C637419%2C554836%2C549647%2C644131%2C621574%2C572465%2C649269%2C644057%2C615292%2C606547%2C442255%2C642353%2C648265%2C630218%2C546701%2C649327%2C281292%2C633176%2C632885%2C610675%2C622045%2C325614%2C620936%2C649526%2C642450%2C634871%2C646070%2C625066%2C614990%2C649284%2C498375%2C613887%2C638335%2C467515%2C644238%2C631638%2C650051%2C648895%2C648270%2C595556%2C647930%2C640690%2C638195%2C589102%2C633487%2C457481%2C649401&ab_client=a1%2Cc4%2Ce1%2Cf1%2Cg2%2Cf7&ab_group=94567%2C102753%2C181428&ab_feature=94567%2C102753&abflag=3&ssmix=a&device_type=SM-A8000&device_brand=samsung&language=zh&os_api=23&os_version=6.0.1&openudid=1869be23a123ab41&manifest_version_code=701&resolution=1080*1920&dpi=480&update_version_code=70108&_rticket=1544875730759&fp=crT_crTZPrGSFlDqFSU1F2KIFzKe&tma_jssdk_version=1.5.3.2&rom_version=23&plugin=26958&ts=1544875730&as=a2054e91026d3cdec44355&mas=0037f78d55165d05d8ec7f161068fbb831cca448e606686ef1`
  );
};

const handleComment = async (articleId: string, itemId: string) => {
  // https://is-hl.snssdk.com/article/v4/tab_comments/?group_id=7340065762189410856&item_id=7340065762189410856&aggr_type=1&count=20&offset=20&tab_index=0&fold=1&iid=53137311418&device_id=57714824519&ac=wifi&channel=samsungapps&aid=13&app_name=news_article&version_code=701&version_name=7.0.1&device_platform=android&ab_version=611287%2C650250%2C486953%2C647938%2C648204%2C642200%2C452159%2C571131%2C641920%2C639003%2C239098%2C612192%2C641906%2C170988%2C643890%2C642339%2C594604%2C374118%2C641855%2C642664%2C644565%2C648685%2C633720%2C613177%2C550042%2C435213%2C603543%2C586998%2C609623%2C642975%2C627128%2C649426%2C614097%2C522766%2C648762%2C416055%2C621360%2C646597%2C639580%2C643097%2C630238%2C558139%2C555254%2C640008%2C635503%2C603442%2C596392%2C550818%2C630577%2C598626%2C644845%2C634911%2C646253%2C603386%2C603399%2C603404%2C603405%2C642681%2C649811%2C646564%2C648850%2C629152%2C607361%2C471797%2C609338%2C326532%2C631168%2C641414%2C646381%2C637865%2C644620%2C638168%2C648057%2C631389%2C644945%2C622716%2C644036%2C622132%2C622993%2C649184%2C640997%2C641075%2C643790%2C631607%2C633139%2C643839%2C637419%2C554836%2C549647%2C644131%2C621574%2C572465%2C649269%2C644057%2C615292%2C606547%2C442255%2C642353%2C648265%2C630218%2C546701%2C649327%2C281292%2C633176%2C632885%2C610675%2C622045%2C325614%2C620936%2C649526%2C642450%2C634871%2C646070%2C625066%2C614990%2C649284%2C498375%2C613887%2C638335%2C467515%2C644238%2C631638%2C650051%2C648895%2C648270%2C595556%2C647930%2C640690%2C638195%2C589102%2C633487%2C457481%2C649401&ab_client=a1%2Cc4%2Ce1%2Cf1%2Cg2%2Cf7&ab_group=94567%2C102753%2C181428&ab_feature=94567%2C102753&abflag=3&ssmix=a&device_type=SM-A8000&device_brand=samsung&language=zh&os_api=23&os_version=6.0.1&openudid=1869be23a123ab41&manifest_version_code=701&resolution=1080*1920&dpi=480&update_version_code=70108&_rticket=1544875730759&fp=crT_crTZPrGSFlDqFSU1F2KIFzKe&tma_jssdk_version=1.5.3.2&rom_version=23&plugin=26958&ts=1544875730&as=a2054e91026d3cdec44355&mas=0037f78d55165d05d8ec7f161068fbb831cca448e606686ef1
  // 写入评论表表，更新文章表
  const currentArticleComment = await getComment(itemId);
  const articleComment = currentArticleComment.data.data;

  for (let i = 0; i < articleComment.length; i++) {
    const comment = articleComment[i].comment;
    // 创建评论
    const commentMo = await commentModel.create({
      create_time: comment.create_time,
      text: comment.text,
      digg_count: comment.digg_count,
      digg_id_list: [],
      user_id: "65d5737e97d6a16021b6bba5",
      article_id: articleId,
    });

    console.log("!!!!", comment.new_reply_list.length);
    // 为评论添加回复
    if (comment.new_reply_list.length) {
      for (let j = 0; j < comment.new_reply_list.length; j++) {
        const reply = comment.new_reply_list[j];
        await replyModel.create({
          create_time: reply.create_time,
          text: reply.text,
          user_id: "65d5737e97d6a16021b6bba5",
          comment_id: commentMo.id,
        });
      }
    }
  }
};

export const crawler = async (type: (typeof TAG_CONST)[number]) => {
  const date = new Date();
  const time = parseInt(String(date.getTime() / 1000));
  const response = await axios.get(
    `https://m.toutiao.com/list/?tag=${type}&count=200&format=json_raw&as=A12665FD9DCA600`
  );

  const data = response.data.data;
  console.log("1111", data.length);
  for (let i = 0; i < data.length; i++) {
    const contentData = data[i];
    console.log("aaa");
    const {
      title,
      abstract,
      has_image,
      middle_image,
      avatar_url,
      has_video,
      image_list,
      large_image_url,
    } = contentData;

    // 不添加视频文章
    if (has_video) {
      continue;
    }

    let tag = contentData.tag;

    // 查找当前文章是否存在
    const currentArticle = await articleModel.findOne({ title });

    const { data: detailData } = await axios.get(
      `http://m.toutiao.com${contentData.source_url}info/`
    );

    const detail = detailData?.data;

    if (!detail) {
      continue;
    }

    // 查找是否有当前作者
    const media = await userModel.findOne(
      {
        account: detail.media_id,
      },
      {
        account: 1,
        password: 1,
      }
    );

    // 没有该用户则注册
    if (!media || !media.account) {
      const userInfo = {
        account: detail.media_id,
        password: detail.media_id,
        introduction:
          detail.media_user.user_auth_info?.auth_info || "该用户暂无简介~",
        avatar:
          avatar_url ||
          detail.media_user.avatar_url ||
          "https://sf1-ttcdn-tos.pstatp.com/obj/larkcloud-file-storage/baas/qctm8y/8e91b81e17773e58_1638443073384.png",
        nickname: detail.source,
        digg_article_id_list: [],
        digg_comment_id_list: [],
        comment_id_list: [],
        reply_id_list: [],
        like_article_id_list: [],
        follow_media_id_list: [],
        history_id_list: [],
        follower_id_list: [],
        tag_list: [],
        type: "media",
        personal_page: `## <div align=\"center\">欢迎━(*｀∀´*)ノ亻!访问我的iNews主页</div>\n<div align=\"center\">\n\n ​🤵**目前职业**\n\n  ​👨**性别：你的性别**  &nbsp;&nbsp;&nbsp;  🚴‍♂️**爱好：你的爱好**\n\n  🏡​**Base：居住地点** &nbsp;🏢 ‍**公司 @公司名称**  \n\n😃 **今日状态：（元气满满/听歌/沉迷学习/摸鱼......）**\n</div>`,
        read_report_list: [],
        is_show_history: false,
      };
      await userModel.create(userInfo);
    }

    const userAct = await userModel.findOne({
      account: detail.media_id,
    });

    if (!userAct) {
      throw new Error("用户不存在");
    }

    const id = userAct._id;

    // 保护这个标签
    if (!TAG_CONST.includes(tag)) {
      tag = TAG_CONST[Math.floor(Math.random() * TAG_CONST.length)];
    }

    const dealContent = await picReChange(
      detail.content,
      `${title}-${new Date()}-details`
    );

    const imageList = image_list || middle_image?.url_list || [];
    const transformImageList = imageList.map((item: any) => item.url);
    const newImageUrls = await transferImages({ urls: transformImageList });

    const firstImage = large_image_url || middle_image?.url || "";

    const newFirstImage = await transferImage({
      url: firstImage,
      fileName: `inews/${title}/image_0`,
    });

    // 如果有这个文章，则更新
    if (currentArticle) {
      await articleModel.updateOne({
        tag,
        title,
        abstract,
        digg_count: detail.digg_count,
        comment_count: 0,
        like_count: detail.like_count,
        has_image: has_image || false,
        image_url: newFirstImage || newImageUrls[0] || "",
        image_list: newImageUrls,
        publish_time: detail.publish_time || Math.floor(Date.now() / 1000),
        media_id: id || "",
        media_user:
          {
            media_name: detail.media_user.screen_name,
            avatar_url: detail.media_user.avatar_url,
            media_info: detail.media_user.user_auth_info?.auth_info,
          } || {},
        content: dealContent,
        digg_id_list: [],
        like_id_list: [],
        read_count: 0,
      });
      continue;
    }

    // 处理完文章信息后，写入文章表
    const newArticle = await articleModel.create({
      tag,
      title,
      abstract,
      digg_count: detail.digg_count,
      comment_count: 0,
      like_count: detail.like_count,
      has_image: has_image || false,
      image_url: newFirstImage || newImageUrls[0] || "",
      image_list: newImageUrls,
      publish_time: detail.publish_time || Math.floor(Date.now() / 1000),
      media_id: id || "",
      media_user:
        {
          media_name: detail.media_user.screen_name,
          avatar_url: detail.media_user.avatar_url,
          media_info: detail.media_user.user_auth_info?.auth_info,
        } || {},
      content: dealContent,
      digg_id_list: [],
      like_id_list: [],
      read_count: 0,
    });
    console.log("!!!!");
    // 处理评论
    await handleComment(newArticle.id, detail.gid);
  }
};
