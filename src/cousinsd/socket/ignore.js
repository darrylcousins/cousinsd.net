
export default ({ data, mongo }) => {
  // remove the inbox item try/catch? check result for success
  //await this.mongo.deleteOne('inbox', {id: data.id});
  const object = await mongo.findOne('inbox', {_id: data.id});
  console.log(object);
  return {
    error: null,
    message: 'Ignore message received\nItem removed',
    object
  };
}
