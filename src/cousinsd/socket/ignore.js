
export default async ({ data, mongo }) => {
  // remove the inbox item try/catch? check result for success
  const object = await mongo.findOne('inbox', {_id: data.id});
  let result;
  try {
    result = await mongo.deleteOne('inbox', {_id: data.id});
  } catch(err) {
    return {
      error: true,
      message: err.message,
      object
    }
  }
  if (result.deletedCount === 1) {
    return {
      error: null,
      message: 'Ignore message received\nItem removed',
      object
    };
  } else {
    return {
      error: true,
      message: 'Item not removed, unknown error',
      object
    };
  }
}
