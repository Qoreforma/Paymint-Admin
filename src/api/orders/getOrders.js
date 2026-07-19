export const getOrders = async () => {
  const response = await fetch("http://localhost:4000/orders");

  return response.json();
};
