class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    // console.log('query obj: ', queryObj);
    const excludedFields = ['sort', 'search', 'limit', 'fields', 'page'];
    excludedFields.forEach((el) => delete queryObj[el]);

    const parsedQuery = this.parseFilterQuery(queryObj);

    this.query = this.query.find(parsedQuery);

    return this;
  }

  parseFilterQuery(queryObj) {
    const parsed = {};
    for (const key in queryObj) {
      const value = queryObj[key];

      if (key.includes('[') && key.includes(']')) {
        const field = key.split('[')[0];
        const operator = key.split('[')[1].replace(']', '');
        if (!parsed[field]) parsed[field] = {};

        parsed[field][`$${operator}`] =
          operator === 'in' ? value.split(',') : isNaN(value) ? value : +value;
      } else {
        parsed[key] = isNaN(value) ? { $regex: value, $options: 'i' } : +value;
      }
    }
    return parsed;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  search(serchFields = []) {
    if (this.queryString.search && serchFields.length > 0) {
      const searchQuery = this.queryString.search;
      const searchConditions = serchFields.map((field) => ({
        [field]: { $regex: searchQuery, $options: 'i' },
      }));

      this.query = this.query.find({ $or: searchConditions });
    }

    return this;
  }
}

export default ApiFeatures;
