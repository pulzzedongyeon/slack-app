import React, { Component } from 'react';
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from 'semantic-ui-react';
import AvatarEditor from 'react-avatar-editor';

import { removeAuthToken } from '../../utils/storage';

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: '',
    croppedImage: '',
    blob: '',
    uploadCroppedImage: '',
    storageRef: "firebase.storage().ref()",
    userRef: "firebase.auth().currentUser",
    usersRef: "firebase.database().ref('users')",
    metadata: {
      contentType: 'image/jpeg'
    }
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  dropdownOptions = () => [
    {
      key: 'user',
      text: <span>Signed in as <strong>{this.state.user.name}</strong></span>,
      disabled: true
    },
    {
      key: 'avatar',
      text: <span onClick={this.openModal}>Change Avatar</span>
    },
    {
      key: 'signuot',
      text: <span onClick={this.handleSignout}>Sign out</span>
    }
  ];

  uploadCroppedImage = () => {
    const { storageRef, userRef, blob, metadata } = this.state;

    storageRef.child(`avatars/users/${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadCroppedImage: downloadURL }, () => {
            this.changeAvatar();
          });
        });
      })
  };

  changeAvatar = () => {
    this.state.userRef.updateProfile({
      profile_image: this.state.uploadCroppedImage
    })
    .then(() => {
      console.log('profile_image updated');
      this.closeModal();
    })
    .catch(err => {
      console.error(err);
    });

    this.state.usersRef.child(this.state.user.uid)
      .update({ avatar: this.state.uploadCroppedImage })
      .then(() => {
        console.log('User avatar updated');
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      })
    }
  };

  handleSignout = () => {
    removeAuthToken();
    window.location.reload();
  };

  render() {
    const { user, modal, previewImage, croppedImage } = this.state;
    const { primaryColor } = this.props;

    return (
      <Grid style={{ background: primaryColor}}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2em', margin: 0 }}>
            {/* APP HEADER */}
            <Header inverted floated="left" as="h2">
              <Header.Content>Chat-App</Header.Content>
            </Header>

            {/* User Dropdown */}
            <Header style={{ padding: '0.25em' }} as="h4">
              <Dropdown trigger={
                <span>
                  <Image src={user.profile_image} spaced="right" avatar/>
                  {user.name}
                </span>
              } options={this.dropdownOptions()} />
            </Header>
          </Grid.Row>

          {/* Change user avatar modal */}
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input fluid type="file" label="New Avatar" name="previewImage"
                onChange={this.handleChange} />

              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor image={previewImage} width={120} height={120}
                        border={50} scale={1.2} ref={node => (this.avatarEditor = node)} />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image style={{ margin: '3.5em auto'}} width={100} height={100} src={croppedImage} />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && <Button color="green" inverted onClick={this.uploadCroppedImage}>
                <Icon name="save" /> Change Avatar
              </Button>}
              <Button color="green" inverted onClick={this.handleCropImage}>
                <Icon name="image" /> Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;