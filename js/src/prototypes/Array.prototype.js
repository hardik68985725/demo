Array.prototype.clean = function (_delete_value) {
  for (let i = 0; i < this.length; i++) {
    if (this[i] == _delete_value) {
      this.splice(i, 1);
      i--;
    }
  }

  return this;
};
