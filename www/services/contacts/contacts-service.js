let service = function contacts(R) {
  let ids = [1, 2, 3];
  return R.map(id => {
    return {
      id: id,
      name: 'contact ' + id
    };
  })(ids);
};

export default service;
