import { useState, useEffect } from 'react';
import { db } from '../services/db';
import './ListGroup.css';

interface TodoItem {
    id?: number;
    text: string;
    datetime: string;
    listId: number;
}

interface TodoList {
    id?: number;
    name: string;
    items: TodoItem[];
}

interface AIOverview {
    summary: string;
    dueTasks: number;
    completedTasks: number;
    upcomingDeadlines: string[];
}

function ListGroup() {
    const [lists, setLists] = useState<TodoList[]>([]);
    const [currentListId, setCurrentListId] = useState<number | null>(null);
    const [items, setItems] = useState<TodoItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [newItem, setNewItem] = useState('');
    const [newDateTime, setNewDateTime] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editDateTime, setEditDateTime] = useState('');
    const [editText, setEditText] = useState('');
    const [newListName, setNewListName] = useState('');
    const [aiOverview, setAIOverview] = useState<AIOverview | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    
    useEffect(() => {
        loadLists();
    }, []);

    useEffect(() => {
        if (currentListId) {
            loadItems(currentListId);
        }
    }, [currentListId]);

    const loadLists = async () => {
        const loadedLists = await db.getLists();
        setLists(loadedLists);
        if (loadedLists.length > 0 && !currentListId) {
            setCurrentListId(loadedLists[0].id || null);
        }
    };

    const loadItems = async (listId: number) => {
        const loadedItems = await db.getItems(listId);
        setItems(loadedItems);
    };

    const handleAddList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newListName.trim()) {
            const listId = await db.createList(newListName.trim());
            setNewListName('');
            await loadLists();
            setCurrentListId(listId);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem.trim() !== '' && currentListId) {
            const item: Omit<TodoItem, 'id'> = {
                text: newItem.trim(),
                datetime: newDateTime,
                listId: currentListId
            };
            await db.addItem(item);
            setNewItem('');
            setNewDateTime('');
            await loadItems(currentListId);
        }
    };

    const handleRemoveItem = async (indexToRemove: number) => {
        const item = items[indexToRemove];
        if (item.id) {
            await db.deleteItem(item.id);
            await loadItems(currentListId!);
            if (selectedIndex === indexToRemove) {
                setSelectedIndex(-1);
            }
        }
    };

    const handleEditItem = (index: number) => {
        setEditingIndex(index);
        setEditText(items[index].text);
        setEditDateTime(items[index].datetime);
    };

    const handleSaveEdit = async (index: number) => {
        const item = items[index];
        if (item.id) {
            const updatedItem = { 
                ...item, 
                text: editText.trim(),
                datetime: editDateTime 
            };
            await db.updateItem(updatedItem);
            setEditingIndex(null);
            await loadItems(currentListId!);
        }
    };

    const handleEditDateTime = (index: number) => {
        setEditingIndex(index);
        setEditDateTime(items[index].datetime);
    };

    const handleSaveDateTime = async (index: number) => {
        const item = items[index];
        if (item.id) {
            const updatedItem = { ...item, datetime: editDateTime };
            await db.updateItem(updatedItem);
            setEditingIndex(null);
            await loadItems(currentListId!);
        }
    };

    const handleDeleteList = async (listId: number) => {
        await db.deleteList(listId);
        await loadLists();
        if (currentListId === listId) {
            setCurrentListId(null);
            setItems([]);
        }
    };

    const formatDateTime = (datetime: string) => {
        if (!datetime) return '';
        const date = new Date(datetime);
        return date.toLocaleString();
    };

    const generateAIOverview = async (listItems: TodoItem[]) => {
        setIsLoadingOverview(true);
        try {
            // Simulate AI processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const now = new Date();
            const dueTasks = listItems.filter(item => {
                const itemDate = new Date(item.datetime);
                return itemDate < now;
            }).length;

            const upcomingDeadlines = listItems
                .filter(item => {
                    const itemDate = new Date(item.datetime);
                    return itemDate > now;
                })
                .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
                .slice(0, 3)
                .map(item => new Date(item.datetime).toLocaleString());

            const overview: AIOverview = {
                summary: `This list has ${listItems.length} tasks. ${dueTasks} tasks are due, and ${listItems.length - dueTasks} are upcoming.`,
                dueTasks,
                completedTasks: 0, // You can add completion status to items if needed
                upcomingDeadlines
            };

            setAIOverview(overview);
        } catch (error) {
            console.error('Error generating AI overview:', error);
        } finally {
            setIsLoadingOverview(false);
        }
    };

    useEffect(() => {
        if (items.length > 0) {
            generateAIOverview(items);
        } else {
            setAIOverview(null);
        }
    }, [items]);

    return (
        <div className="apple-container">
            <div className="header-section">
                <h1 className="apple-title">Todo Lists</h1>
                <p className="subtitle">Manage your tasks with style</p>
            </div>

            <form onSubmit={handleAddList} className="list-form">
                <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Create a new list..."
                    className="apple-input"
                />
                <button type="submit" className="apple-button">
                    <span className="button-icon">+</span>
                    Add List
                </button>
            </form>

            <div className="lists-container">
                {lists.map(list => (
                    <div 
                        key={list.id} 
                        className={`list-card ${currentListId === list.id ? 'active' : ''}`}
                        onClick={() => setCurrentListId(list.id!)}
                    >
                        <div className="list-header">
                            <h3>{list.name}</h3>
                            <button 
                                className="delete-list-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteList(list.id!);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {currentListId && (
                <>
                    <form onSubmit={handleAddItem} className="apple-form">
                        <div className="input-group">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder="Add a new task..."
                                    className="apple-input"
                                />
                                <span className="input-icon">📝</span>
                            </div>
                            <div className="input-wrapper">
                                <input
                                    type="datetime-local"
                                    value={newDateTime}
                                    onChange={(e) => setNewDateTime(e.target.value)}
                                    className="datetime-input"
                                />
                                <span className="input-icon">⏰</span>
                            </div>
                        </div>
                        <button type="submit" className="apple-button">
                            <span className="button-icon">+</span>
                            Add Task
                        </button>
                    </form>

                    <div className="list-container">
                        <ul className="apple-list">
                            {items.map((item, index) => (
                                <li 
                                    key={item.id} 
                                    className={`apple-list-item ${selectedIndex === index ? 'active' : ''}`}
                                >
                                    <div className="item-content-wrapper">
                                        <div className="item-header">
                                            {editingIndex === index ? (
                                                <div className="edit-item-group">
                                                    <input
                                                        type="text"
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        className="edit-input"
                                                        autoFocus
                                                    />
                                                    <input
                                                        type="datetime-local"
                                                        value={editDateTime}
                                                        onChange={(e) => setEditDateTime(e.target.value)}
                                                        className="datetime-input edit"
                                                    />
                                                    <button 
                                                        className="save-button"
                                                        onClick={() => handleSaveEdit(index)}
                                                    >
                                                        <span className="button-icon">✓</span>
                                                        Save
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span 
                                                        className="item-content"
                                                        onClick={() => setSelectedIndex(index)}
                                                    >
                                                        {item.text}
                                                    </span>
                                                    <div className="item-actions">
                                                        {item.datetime && (
                                                            <span className="datetime-display">
                                                                <span className="icon">⏰</span>
                                                                {formatDateTime(item.datetime)}
                                                            </span>
                                                        )}
                                                        <button 
                                                            className="edit-button"
                                                            onClick={() => handleEditItem(index)}
                                                        >
                                                            <span className="icon">✏️</span>
                                                            Edit
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        className="remove-button"
                                        onClick={() => handleRemoveItem(index)}
                                        title="Remove task"
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {items.length > 0 && (
                        <div className="ai-overview">
                            <div className="ai-overview-header">
                                <span className="ai-overview-icon">🤖</span>
                                <h3 className="ai-overview-title">AI Overview</h3>
                            </div>
                            {isLoadingOverview ? (
                                <div className="ai-overview-loading">
                                    Analyzing tasks...
                                </div>
                            ) : aiOverview && (
                                <div className="ai-overview-content">
                                    <p>{aiOverview.summary}</p>
                                    {aiOverview.upcomingDeadlines.length > 0 && (
                                        <div>
                                            <p>Upcoming deadlines:</p>
                                            <ul>
                                                {aiOverview.upcomingDeadlines.map((deadline, index) => (
                                                    <li key={index}>{deadline}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default ListGroup;