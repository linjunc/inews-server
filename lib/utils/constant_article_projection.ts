export default async function () {
  const projection = {
    publish_time: 1,
    image_url: 1,
    media_id: 1,
    media_user: 1,
    like_count: 1,
    title: 1,
    abstract: 1,
    tag: 1,
    digg_count: 1,
    comment_count: 1,
    has_image: 1,
    image_list: 1,
    read_count: 1,
  };
  return {
    projection,
  };
}
