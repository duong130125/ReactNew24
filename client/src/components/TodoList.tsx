import { useEffect, useRef, useState } from "react";
import "./TodoList.css";
import axios from "axios";
interface Products {
  id: number;
  name: string;
  status: boolean;
}

export default function TodoList() {
  const [tasks, setTasks] = useState<Products[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Products | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const inputRef = useRef<null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Products | null>(null);
  const [editedTaskName, setEditedTaskName] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "active">("all");
  const [showDeleteCompletedModal, setShowDeleteCompletedModal] =
    useState<boolean>(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:8080/Products");
      setTasks(response.data);
    } catch (error) {
      console.error("Xảy ra lỗi.", error);
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      if (tasks.some((task) => task.name === newTask)) {
        setErrorMsg("Tên công việc đã tồn tại.");
        return;
      }

      try {
        const response = await axios.post("http://localhost:8080/Products", {
          name: newTask,
          status: false,
        });

        setTasks([...tasks, response.data]);
        setNewTask("");
        setErrorMsg("");
      } catch (error) {
        console.error("Xảy ra lỗi.", error);
      }
    } else {
      setErrorMsg("Tên công việc không được để trống.");
    }
  };

  const handleToggleTask = async (id: number) => {
    const task = tasks.find((task) => task.id === id);
    if (task) {
      try {
        const response = await axios.put(
          ` http://localhost:8080/Products/${id}`,
          {
            ...task,
            status: !task.status,
          }
        );
        setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
      } catch (error) {
        console.error("Xảy ra lỗi.", error);
      }
    }
  };

  const handleDeleteTask = (id: number, name: string) => {
    setTaskToDelete({ id, name, status: false });
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await axios.delete(`http://localhost:8080/Products/${taskToDelete.id}`);
        setTasks(tasks.filter((task) => task.id !== taskToDelete.id));
        setShowModal(false);
        setTaskToDelete(null);
      } catch (error) {
        console.error("Xảy ra lỗi.", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setTaskToDelete(null);
  };

  const handleEditTask = (task: Products) => {
    setTaskToEdit(task);
    setEditedTaskName(task.name);
    setShowEditModal(true);
  };

  const handleConfirmEditTask = async () => {
    if (taskToEdit && editedTaskName.trim() !== "") {
      try {
        const response = await axios.put(
          `http://localhost:8080/Products/${taskToEdit.id}`,
          {
            ...taskToEdit,
            name: editedTaskName,
          }
        );
        setTasks(
          tasks.map((task) =>
            task.id === taskToEdit.id ? response.data : task
          )
        );
        setShowEditModal(false);
        setTaskToEdit(null);
        setEditedTaskName("");
      } catch (error) {
        console.error("Xảy ra lỗi.", error);
      }
    }
  };

  const handleCancelEditTask = () => {
    setShowEditModal(false);
    setTaskToEdit(null);
    setEditedTaskName("");
  };

  const handleDeleteCompletedTasks = () => {
    setShowDeleteCompletedModal(true);
  };

  const handleConfirmDeleteCompletedTasks = async () => {
    try {
      const completedTasks = tasks.filter((task) => task.status);
      await Promise.all(
        completedTasks.map((task) =>
          axios.delete(`http://localhost:8080/Products/${task.id}`)
        )
      );
      setTasks(tasks.filter((task) => !task.status));
      setShowDeleteCompletedModal(false);
    } catch (error) {
      console.error("Xảy ra lỗi.", error);
    }
  };

  const handleDeleteAllTasks = () => {
    setShowDeleteAllModal(true);
  };

  const handleConfirmDeleteAllTasks = () => {
    try {
      axios.delete("http://localhost:8080/Products");
      setTasks([]);
      setShowDeleteAllModal(false);
    } catch (error) {
      console.error("Xảy ra lỗi.", error);
    }
  };

  return (
    <>
      <div className="task-manager">
        <h2>Quản lý công việc</h2>
        <div className="task-input">
          <input
            type="text"
            value={newTask}
            onChange={(e) => {
              setNewTask(e.target.value);
              setErrorMsg("");
            }}
            ref={inputRef}
          />
          {errorMsg && <span style={{ color: "red" }}>{errorMsg}</span>}
          <button onClick={handleAddTask}>Thêm công việc</button>
        </div>
        <div className="task-filters">
          <button onClick={() => setFilter("all")}>Tất cả</button>
          <button onClick={() => setFilter("completed")}>Hoàn thành</button>
          <button onClick={() => setFilter("active")}>Đang thực hiện</button>
        </div>
        <ul className="task-list">
          {tasks
            .filter((task) => {
              if (filter === "completed") {
                return task.status;
              } else if (filter === "active") {
                return !task.status;
              } else {
                return true;
              }
            })
            .map((task) => (
              <li key={task.id} className={task.status ? "completed" : ""}>
                <div>
                  <input
                    type="checkbox"
                    checked={task.status}
                    onChange={() => handleToggleTask(task.id)}
                  />
                  {task.name}
                </div>
                <div>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditTask(task)}
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteTask(task.id, task.name)}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
        </ul>
        <div className="task-actions">
          <button onClick={handleDeleteCompletedTasks}>
            Xóa công việc hoàn thành
          </button>
          <button onClick={handleDeleteAllTasks}>Xóa tất cả công việc</button>
        </div>
      </div>

      {showModal && taskToDelete && (
        <div className="modal">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn chắc chắn muốn xóa công việc "{taskToDelete.name}" không?</p>
            <div className="modal-buttons">
              <button
                style={{ backgroundColor: "#e4e1e1" }}
                onClick={handleCancelDelete}
              >
                Hủy
              </button>
              <button
                style={{ backgroundColor: "red" }}
                onClick={handleConfirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && taskToEdit && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sửa công việc</h3>
            <input
              type="text"
              value={editedTaskName}
              onChange={(e) => setEditedTaskName(e.target.value)}
            />
            <div className="modal-buttons">
              <button
                style={{ backgroundColor: "#e4e1e1", color: "black" }}
                onClick={handleCancelEditTask}
              >
                Hủy
              </button>
              <button
                style={{ backgroundColor: "blueviolet" }}
                onClick={handleConfirmEditTask}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteCompletedModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn chắc chắn muốn xóa các công việc đã hoàn thành không?</p>
            <div className="modal-buttons">
              <button
                style={{ backgroundColor: "#e4e1e1" }}
                onClick={() => setShowDeleteCompletedModal(false)}
              >
                Hủy
              </button>
              <button
                style={{ backgroundColor: "red" }}
                onClick={handleConfirmDeleteCompletedTasks}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAllModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn chắc chắn muốn xóa tất cả các công việc không?</p>
            <div className="modal-buttons">
              <button
                style={{ backgroundColor: "#e4e1e1" }}
                onClick={() => setShowDeleteAllModal(false)}
              >
                Hủy
              </button>
              <button
                style={{ backgroundColor: "red" }}
                onClick={handleConfirmDeleteAllTasks}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
