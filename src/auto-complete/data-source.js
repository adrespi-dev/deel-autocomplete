export class DataSource {
  constructor(opts) {
    this.cache = {};
    this.itemsLimit = opts.itemsLimit || 5;
  }

  // In production, we would need a way to invalidate the cache
  // after some time
  async search(rawSearchTerm) {
    const searchTerm = rawSearchTerm.toLowerCase();

    if (!searchTerm) {
      return [];
    }

    // return cache response
    if (this.cache[searchTerm]) {
      return this.cache[searchTerm];
    }

    // if response is not cached,perform the search
    const items = await this.search_impl(searchTerm);
    const response = this.highlighResults(searchTerm, items);
    this.cache[searchTerm] = response;

    return response;
  }

  highlighResults(searchTerm, items) {
    const pattern = new RegExp(`(${searchTerm})`, 'gi');
    const template = "<span class='highlight'>$1</span>";

    return items.map((item) => ({
      text: item,
      highlightedText: item.replaceAll(pattern, template),
    }));
  }
}

export class ArrayDataSource extends DataSource {
  constructor(opts) {
    super(opts);
    const { items } = opts;
    this.items = items.sort();
  }

  async search_impl(searchTerm) {
    const results = [];
    for (let item of this.items) {
      if (item.toLowerCase().includes(searchTerm)) {
        results.push(item);

        if (results.length === this.itemsLimit) {
          return results;
        }
      }
    }

    return results;
  }
}

export class RemoteDataSource extends DataSource {
  constructor(opts) {
    super(opts);
    const { performRequest } = opts;

    this.performRequest = performRequest;
  }

  async search_impl(searchTerm) {
    return await this.performRequest(searchTerm, this.itemsLimit);
  }
}
