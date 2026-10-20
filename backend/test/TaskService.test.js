const test = require("node:test");
const assert = require("node:assert/strict");
const { TaskService } = require("../src/application/TaskService");

function createRepository() {
  const tasks = [];
  return {
    tasks,
    findAll() {
      return [...tasks];
    },
    create(data) {
      const task = { id: tasks.length + 1, ...data };
      tasks.push(task);
      return task;
    },
    updateStatus(id, status) {
      const task = tasks.find(item => item.id === Number(id));
      if (!task) return null;
      task.status = status;
      return task;
    }
  };
}

test("creates a normalized task with the default status", () => {
  const service = new TaskService(createRepository());

  const task = service.createTask({ title: "  Revisar código  ", description: "  Separar capas  " });

  assert.deepEqual(task, {
    id: 1,
    title: "Revisar código",
    description: "Separar capas",
    status: "pendiente"
  });
});

test("rejects titles shorter than three characters", () => {
  const service = new TaskService(createRepository());

  assert.throws(
    () => service.createTask({ title: " a " }),
    { message: "El título debe tener al menos 3 caracteres.", statusCode: 400 }
  );
});

test("changes the status of an existing task", () => {
  const service = new TaskService(createRepository());
  const task = service.createTask({ title: "Revisar código" });

  assert.equal(service.changeStatus(task.id, "finalizada").status, "finalizada");
});

test("rejects invalid statuses and missing tasks", () => {
  const service = new TaskService(createRepository());

  assert.throws(
    () => service.changeStatus(1, "bloqueada"),
    { message: "Estado inválido. Use: pendiente, en progreso, finalizada.", statusCode: 400 }
  );
  assert.throws(
    () => service.changeStatus(99, "pendiente"),
    { message: "No existe una tarea con ese identificador.", statusCode: 404 }
  );
});
