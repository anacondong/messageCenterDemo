import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [customerInbox, setCustomerInbox] = useState([]);
    const [customerOutbox, setCustomerOutbox] = useState([]);

    const [employeeInbox, setEmployeeInbox] = useState([]);
    const [employeeOutbox, setEmployeeOutbox] = useState([]);

    const [customerNewMessage, setCustomerNewMessage] = useState({ subject: '', content: '' });
    const [employeeNewMessage, setEmployeeNewMessage] = useState({ subject: '', content: '' });
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [replyToMessage, setReplyToMessage] = useState(null);
    const [customerFormTitle, setCustomerFormTitle] = useState('Send New Message');
    const [employeeFormTitle, setEmployeeFormTitle] = useState('Send New Message');
    const [selectedMessage, setSelectedMessage] = useState(null); // New state for selected message
    const [customerActiveTab, setCustomerActiveTab] = useState('inbox'); // New state for customer active tab
    const [employeeActiveTab, setEmployeeActiveTab] = useState('inbox'); // New state for employee active tab

    const openCustomerModal = (message = null) => {
        setReplyToMessage(message);
        if (message) {
            setCustomerNewMessage({ subject: `Re: ${message.subject}`, content: `\n\n--- Original Message ---\nFrom: ${message.senderRole}\nTo: ${message.receiverRole}\nSubject: ${message.subject}\nDate: ${new Date(message.timestamp).toLocaleString()}\n\n${message.content}` });
            setCustomerFormTitle('Reply to Message');
        } else {
            setCustomerNewMessage({ subject: '', content: '' });
            setCustomerFormTitle('Send New Message');
        }
        setShowCustomerModal(true);
    };

    const closeCustomerModal = () => {
        setShowCustomerModal(false);
        setReplyToMessage(null);
        setCustomerNewMessage({ subject: '', content: '' });
        setCustomerFormTitle('Send New Message');
    };

    const openEmployeeModal = (message = null) => {
        setReplyToMessage(message);
        if (message) {
            setEmployeeNewMessage({ subject: `Re: ${message.subject}`, content: `\n\n--- Original Message ---\nFrom: ${message.senderRole}\nTo: ${message.receiverRole}\nSubject: ${message.subject}\nDate: ${new Date(message.timestamp).toLocaleString()}\n\n${message.content}` });
            setEmployeeFormTitle('Reply to Message');
        } else {
            setEmployeeNewMessage({ subject: '', content: '' });
            setEmployeeFormTitle('Send New Message');
        }
        setShowEmployeeModal(true);
    };

    const closeEmployeeModal = () => {
        setShowEmployeeModal(false);
        setReplyToMessage(null);
        setEmployeeNewMessage({ subject: '', content: '' });
        setEmployeeFormTitle('Send New Message');
    };

    const fetchMessages = async (role, boxType, setter) => {
        try {
            const response = await fetch(`http://localhost:8080/api/messages/byRoleAndBoxType?role=${role}&boxType=${boxType}`);
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setter(sortedData);
        } catch (error) {
            console.error(`Error fetching ${role} ${boxType}:`, error);
        }
    };

    useEffect(() => {
        fetchMessages('customer', 'inbox', setCustomerInbox);
        fetchMessages('customer', 'outbox', setCustomerOutbox);
        fetchMessages('employee', 'inbox', setEmployeeInbox);
        fetchMessages('employee', 'outbox', setEmployeeOutbox);
    }, []);

    const handleCustomerTabChange = (tab) => {
        setCustomerActiveTab(tab);
    };

    const handleEmployeeTabChange = (tab) => {
        setEmployeeActiveTab(tab);
    };

    const handleSendMessage = async (senderRole, receiverRole, messageData) => {
        try {
            const response = await fetch('http://localhost:8080/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...messageData, senderRole, receiverRole, parentId: replyToMessage ? replyToMessage.id : null }),
            });
            const newMessage = await response.json();

            // Update sender's outbox and receiver's inbox
            if (senderRole === 'customer') {
                setCustomerOutbox(prev => [...prev, newMessage]);
                setCustomerNewMessage({ subject: '', content: '' });
                fetchMessages('customer', 'outbox', setCustomerOutbox); // Re-fetch outbox
                fetchMessages('employee', 'inbox', setEmployeeInbox); // Re-fetch employee inbox
            } else if (senderRole === 'employee') {
                setEmployeeOutbox(prev => [...prev, newMessage]);
                setEmployeeNewMessage({ subject: '', content: '' });
                fetchMessages('employee', 'outbox', setEmployeeOutbox); // Re-fetch outbox
                fetchMessages('customer', 'inbox', setCustomerInbox); // Re-fetch customer inbox
            }
            setReplyToMessage(null); // Clear reply state after sending
            if (senderRole === 'customer') {
                closeCustomerModal();
            } else if (senderRole === 'employee') {
                closeEmployeeModal();
            }
            setSelectedMessage(null); // Close message detail after sending reply
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleCustomerInputChange = (name, value) => {
        setCustomerNewMessage(prev => ({ ...prev, [name]: value }));
    };

    const handleEmployeeInputChange = (name, value) => {
        setEmployeeNewMessage(prev => ({ ...prev, [name]: value }));
    };

    const handleMessageRowClick = (message) => {
        setSelectedMessage(message);
    };

    const closeMessageDetail = () => {
        setSelectedMessage(null);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Message Center</h1>
            </header>
            <main className="main-content">
                <div className="customer-section">
                    <h2>Customer Portal</h2>
                    <button onClick={() => openCustomerModal()}>New Message</button>
                    {showCustomerModal && (
                        <Modal onClose={closeCustomerModal}>
                            <MessageForm
                                senderRole="customer"
                                receiverRole="employee"
                                messageData={customerNewMessage}
                                onInputChange={handleCustomerInputChange}
                                onSendMessage={handleSendMessage}
                                replyToMessage={replyToMessage}
                                formTitle={customerFormTitle}
                            />
                        </Modal>
                    )}
                    <div className="tabs">
                        <button
                            className={customerActiveTab === 'inbox' ? 'tab-button active' : 'tab-button'}
                            onClick={() => handleCustomerTabChange('inbox')}
                        >
                            Inbox
                        </button>
                        <button
                            className={customerActiveTab === 'outbox' ? 'tab-button active' : 'tab-button'}
                            onClick={() => handleCustomerTabChange('outbox')}
                        >
                            Outbox
                        </button>
                    </div>
                    <div className="tab-content">
                        {customerActiveTab === 'inbox' && (
                            <MessageList title="Customer Inbox" messages={customerInbox} onRowClick={handleMessageRowClick} />
                        )}
                        {customerActiveTab === 'outbox' && (
                            <MessageList title="Customer Outbox" messages={customerOutbox} onRowClick={handleMessageRowClick} />
                        )}
                    </div>
                </div>

                <div className="employee-section">
                    <h2>Employee Portal</h2>
                    <button onClick={() => openEmployeeModal()}>New Message</button>
                    {showEmployeeModal && (
                        <Modal onClose={closeEmployeeModal}>
                            <MessageForm
                                senderRole="employee"
                                receiverRole="customer"
                                messageData={employeeNewMessage}
                                onInputChange={handleEmployeeInputChange}
                                onSendMessage={handleSendMessage}
                                replyToMessage={replyToMessage}
                                formTitle={employeeFormTitle}
                            />
                        </Modal>
                    )}
                    <div className="tabs">
                        <button
                            className={employeeActiveTab === 'inbox' ? 'tab-button active' : 'tab-button'}
                            onClick={() => handleEmployeeTabChange('inbox')}
                        >
                            Inbox
                        </button>
                        <button
                            className={employeeActiveTab === 'outbox' ? 'tab-button active' : 'tab-button'}
                            onClick={() => handleEmployeeTabChange('outbox')}
                        >
                            Outbox
                        </button>
                    </div>
                    <div className="tab-content">
                        {employeeActiveTab === 'inbox' && (
                            <MessageList title="Employee Inbox" messages={employeeInbox} onRowClick={handleMessageRowClick} />
                        )}
                        {employeeActiveTab === 'outbox' && (
                            <MessageList title="Employee Outbox" messages={employeeOutbox} onRowClick={handleMessageRowClick} />
                        )}
                    </div>
                </div>

                {selectedMessage && (
                    <Modal onClose={closeMessageDetail}>
                        <MessageDetail
                            message={selectedMessage}
                            onReplyClick={(message) => {
                                if (selectedMessage.senderRole === 'customer') {
                                    openCustomerModal(message);
                                } else {
                                    openEmployeeModal(message);
                                }
                                closeMessageDetail(); // Close message detail modal when reply is clicked
                            }}
                        />
                    </Modal>
                )}
            </main>
        </div>
    );
}

const MessageList = ({ title, messages, onRowClick }) => (
    <div className="message-section">
        <h3>{title}</h3>
        {messages.length === 0 ? (
            <p>No messages in {title.toLowerCase()}.</p>
        ) : (
            <table className="message-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Content</th>
                    </tr>
                </thead>
                <tbody>
                    {messages.map(message => (
                        <tr key={message.id} onClick={() => onRowClick(message)} className="message-row">
                            <td>{message.subject}</td>
                            <td>{message.content.substring(0, 100)}...</td> {/* Displaying a snippet of content */}
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);

const MessageDetail = ({ message, onReplyClick }) => (
    <div className="message-detail-section">
        <h3>Message Details</h3>
        <p><strong>Subject:</strong> {message.subject}</p>
        <p><strong>From:</strong> {message.senderRole}</p>
        <p><strong>To:</strong> {message.receiverRole}</p>
        <p><strong>Content:</strong> {message.content}</p>
        <p className="timestamp"><strong>Sent:</strong> {new Date(message.timestamp).toLocaleString()}</p>
        <button onClick={() => onReplyClick(message)}>Reply</button>
    </div>
);

const MessageForm = ({ senderRole, receiverRole, messageData, onInputChange, onSendMessage, replyToMessage, formTitle }) => {
    return (
        <div className="message-form-section">
            <h3>{formTitle}</h3>
            <form onSubmit={(e) => { e.preventDefault(); onSendMessage(senderRole, receiverRole, messageData); }}>
                <label htmlFor="subject">Subject</label>
                <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Subject"
                    value={messageData.subject}
                    onChange={(e) => onInputChange(e.target.name, e.target.value)}
                    required
                />
                <label htmlFor="content">Content</label>
                <textarea
                    id="content"
                    name="content"
                    placeholder="Content"
                    value={messageData.content}
                    onChange={(e) => onInputChange(e.target.name, e.target.value)}
                    required
                ></textarea>
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default App;

const Modal = ({ onClose, children }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                {children}
            </div>
        </div>
    );
};