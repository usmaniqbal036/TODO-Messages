import Todo from '../models/Todo.js';

const validationMessage = (error) =>
  error?.name === 'ValidationError'
    ? Object.values(error.errors).map((e) => e.message).join(', ')
    : null;


const getTodos = async (req, res) => {
  try {
    const { completed, priority, sort } = req.query;

    const filter = { user: req.user.id };
    
    if (completed !== undefined) filter.completed = completed === 'true';
    if (priority) filter.priority = priority;

    let sortBy = { createdAt: -1 };
    if (sort === 'oldest') sortBy = { createdAt: 1 };
    if (sort === 'dueDate') sortBy = { dueDate: 1 };

    const todos = await Todo.find(filter).sort(sortBy);
    res.json(todos);
  } catch (error) {
    console.error('Get Todos error', error.message);
    res.status(500).json({ message: 'Server error fetching Todos' });
  }
};

const getTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    console.error('Get Todo error', error.message);
    res.status(500).json({ message: 'Server error fetching Todo' });
  }
};

const createTodo = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const todo = await Todo.create({
      title,
      description,
      priority,
      dueDate: dueDate || null,
      user: req.user.id,
    });

    res.status(201).json(todo);
  } catch (error) {
    const msg = validationMessage(error);
    if (msg) return res.status(400).json({ message: msg });

    console.error('Create Todo error', error.message);
    res.status(500).json({ message: 'Server error creating Todo' });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate } = req.body;

    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (completed !== undefined) todo.completed = completed;
    if (priority !== undefined) todo.priority = priority;
    
    if (dueDate !== undefined) todo.dueDate = dueDate || null;

    const updated = await todo.save();
    res.json(updated);
  } catch (error) {
    const msg = validationMessage(error);
    if (msg) return res.status(400).json({ message: msg });

    console.error('Update Todo error:', error.message);
    res.status(500).json({ message: 'Server error updating todo' });
  }
};

const deleteTodo = async (req, res) => {
  try {
    
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete Todo error', error.message);
    res.status(500).json({ message: 'Server error deleting Todo' });
  }
};

export { getTodos, getTodo, createTodo, updateTodo, deleteTodo };
