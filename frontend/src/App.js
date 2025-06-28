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

    const fetchMessages = async (role, setter) => {
        try {
            const response = await fetch(`http://localhost:8080/api/messages/byRole?role=${role}`);
            const data = await response.json();
            setter(data);
        } catch (error) {
            console.error(`Error fetching ${role}:`, error);
        }
    };

    useEffect(() => {
        fetchMessages('customer', 'inbox', setCustomerInbox);
        fetchMessages('customer', 'outbox', setCustomerOutbox);

        fetchMessages('employee', 'inbox', setEmployeeInbox);
        fetchMessages('employee', 'outbox', setEmployeeOutbox);
    }, []);

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

            // Update sender's outbox
            if (senderRole === 'customer') {
                setCustomerOutbox(prev => [...prev, newMessage]);
                setCustomerNewMessage({ subject: '', content: '' });
            } else if (senderRole === 'employee') {
                setEmployeeOutbox(prev => [...prev, newMessage]);
                setEmployeeNewMessage({ subject: '', content: '' });
            }

            // Update receiver's inbox
            if (receiverRole === 'customer') {
                setCustomerInbox(prev => [...prev, newMessage]);
            } else if (receiverRole === 'employee') {
                setEmployeeInbox(prev => [...prev, newMessage]);
            }
            setReplyToMessage(null); // Clear reply state after sending
            if (senderRole === 'customer') {
                closeCustomerModal();
            } else if (senderRole === 'employee') {
                closeEmployeeModal();
            }
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
                    <MessageList title="Customer Inbox" messages={customerInbox} role="customer" openModalForReply={openCustomerModal} />
                    <MessageList title="Customer Outbox" messages={customerOutbox} role="customer" openModalForReply={openCustomerModal} />
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
                    <MessageList title="Employee Inbox" messages={employeeInbox} role="employee" openModalForReply={openEmployeeModal} />
                    <MessageList title="Employee Outbox" messages={employeeOutbox} role="employee" openModalForReply={openEmployeeModal} />
                </div>
            </main>
        </div>
    );
}

const MessageList = ({ title, messages, role, openModalForReply }) => (
    <div className="message-section">
        <h3>{title}</h3>
        {messages.length === 0 ? (
            <p>No messages in {title.toLowerCase()}.</p>
        ) : (
            messages.map(message => (
                <div key={message.id} className="message-item">
                    <h4>{message.subject}</h4>
                    <p>From: {message.senderRole}</p>
                    <p>To: {message.receiverRole}</p>
                    <p>{message.content}</p>
                    <p className="timestamp">{new Date(message.timestamp).toLocaleString()}</p>
                    <button onClick={() => openModalForReply(message)}>Reply</button>
                </div>
            ))
        )}
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