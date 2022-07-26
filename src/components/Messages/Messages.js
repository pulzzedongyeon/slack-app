import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Comment } from "semantic-ui-react";
import { setUserPosts } from '../../actions';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import Skeleton from './Skeleton';

class Messages extends Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: "firebase.database().ref('privateMessages')",
    messagesRef: "firebase.database().ref('messages')",
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    usersRef: "firebase.database().ref('users')",
    progressBar: false,
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    connectedRef: "firebase.database().ref('.info/connected')",
    listeners: []
  };

  componentDidMount() {
    const { channel, user, listeners } = this.state;

    if (channel && user) {
      this.removeListeners(listeners);
      this.addListeners(channel.id);
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }

  removeListeners = listeners => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event);
    })
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex(listener => {
      return listener.id === id && listener.ref === ref && listener.event === event;
    });

    if (index === -1) {
      const newListener = { id, ref, event };
      this.setState({ listeners: this.state.listeners.concat(newListener) });
    }
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
  };

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();

    ref.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val());

      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });

      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });

    this.addToListeners(channelId, ref, 'child_added');
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  handleSearchChange = event => {
    this.setState({
      searchTerm: event.target.value,
      searchLoading: true
    }, () => this.handleSearchMessages());
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, 'gi');
    const searchResults = channelMessages.reduce((acc, message) => {
      if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
        acc.push(message);
      }

      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }

      return acc;
    }, []);

    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `#${uniqueUsers.length} user${plural ? 's' : ''}`;
    this.setState({ numUniqueUsers });
  };

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        };
      }

      return acc;
    }, {});

    this.props.setUserPosts(userPosts);
  };

  displayMessages = messages => (
    messages.length > 0 && messages.map(message => (
      <Message key={message.timestamp} message={message} user={this.state.user} />
    ))
  );

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({ progressBar: true });
    }
  };

  displayChannelName = channel => {
    return channel ? `${this.state.privateChannel ? '@' : "#"}${channel.name}` : '';
  };

  displayMessageSkeleton = loading => (
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null );

  render() {
    const { messagesRef, channel, user, messages, progressBar, numUniqueUsers,
      searchTerm, searchResults, searchLoading, privateChannel,
      messagesLoading } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader channelName={this.displayChannelName(channel)} numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange} searchLoading={searchLoading}/>

        <Segment>
          <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
            {this.displayMessageSkeleton(messagesLoading)}
            {
              searchTerm
                ? this.displayMessages(searchResults)
                : this.displayMessages(messages)
            }
            <div ref={node => this.messagesEnd = node}></div>
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
