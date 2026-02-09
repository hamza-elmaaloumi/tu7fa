

export function extractErrorMessage(err: any): string {
  if (err.response?.data) {
    const data = err.response.data;

    if (typeof data === 'object') {
      const firstValue = Object.values(data)[0];
      if (Array.isArray(firstValue)) return firstValue[0];
      if (typeof firstValue === 'string') return firstValue;
      return JSON.stringify(firstValue);
    }

    //if (typeof data === 'string') return data;
  }

  return 'Something went wrong, please try again later.';
}