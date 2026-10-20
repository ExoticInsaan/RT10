// A resource with price 0 is free. Everything that shows a price goes through here.
export const isFree = (price: number) => Number(price) <= 0;

export const priceText = (price: number) => (isFree(price) ? "Free" : `₹ ${price}`);
