const BASE_URL = 'http://localhost:8000/todos';
export const fetchTodos = async () => {
  return await fetch(`${BASE_URL}`)
    .then(data => {
      return data.json();
    })
    .catch(err => console.log(err));
};
console.log(fetchTodos().then(data => console.log(data)));
