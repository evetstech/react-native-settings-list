'use strict'

import React from 'react';

import {
  View,
  TouchableHighlight,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Image
} from 'react-native';

const ARROW_ICON = require('./img/icon-arrow-settings.png');

class SettingsList extends React.Component {
  static propTypes = {
    backgroundColor: React.PropTypes.string,
    borderColor: React.PropTypes.string,
    defaultItemSize: React.PropTypes.number,
    underlayColor: React.PropTypes.string,
    defaultTitleStyle: Text.propTypes.style,
    defaultTitleInfoPosition: React.PropTypes.string,
    scrollViewProps: React.PropTypes.object,
  };

  static defaultProps ={
    //backgroundColor: 'white', // Reduce overdraw
    borderColor: 'black',
    defaultItemSize: 50,
    //underlayColor: 'transparent', Reduce overdraw
    defaultTitleStyle: {fontSize: 16}
  };

  _getGroups(){
    var groupNumber = -1;
    let headers = [];
    let itemGroup = [];
    let result = [];
    let other = [];
    React.Children.forEach(this.props.children, (child) => {
      // Allow for null, optional fields
      if(!child) return;

      if(child.type.displayName === 'Header'){
        if(groupNumber != -1){
          result[groupNumber] = {items: itemGroup, header: headers[groupNumber], other: other};
          itemGroup = [];
          other = [];
        }
        groupNumber++;
        headers[groupNumber] = child.props;
      } else if(child.type.displayName === 'Item'){
        if(groupNumber == -1){
          groupNumber++;
        }
        itemGroup.push(child.props);
      } else {
        if(groupNumber == -1){
          groupNumber++;
        }
        other.push(child);
      }
    });
    result[groupNumber] = {items: itemGroup, header: headers[groupNumber], other: other};
    return result;
  }

  render(){
    return (
      <ScrollView {...this.props.scrollViewProps}>
        {this._getGroups().map((group, index) => {
          return this._groupView(group, index);
        })}
      </ScrollView>
    )
  }

  _groupView(group, index){
    if(group.header){
      return (
        <View key={'group_' + index}>
          {group.other}
          <Text style={[{margin:5},group.header.headerStyle]} numberOfLines={1} ellipsizeMode="tail">{group.header.headerText}</Text>
          <View style={{borderTopWidth:1, borderBottomWidth:1, borderColor: this.props.borderColor}}>
            {group.items.map((item, index) => {
              return this._itemView(item,index, group.items.length);
            })}
          </View>
        </View>
      )
    } else {
      return (
        <View key={'group_' + index}>
          {group.other}
          <View style={{borderTopWidth:1, borderBottomWidth:1, borderColor: this.props.borderColor}}>
            {group.items.map((item, index) => {
              return this._itemView(item,index, group.items.length);
            })}
          </View>
        </View>
      )
    }
  }

  _itemEditableBlock(item, index, position) {

    return ([
        <Text
            key={'itemTitle_' + index}
            style={[
              item.titleStyle ? item.titleStyle : this.props.defaultTitleStyle,
              position === 'Bottom' ? null : styles.titleText
            ]}>
            {item.title}
        </Text>,
        item.isEditable ?
        <TextInput
              key={item.id}
              style={item.editableTextStyle ? item.editableTextStyle : item.editableText}
              placeholder = {item.placeholder}
              onChangeText={(text) => item.onTextChange(text)}
              value={item.value} />
        : null
    ])
  }

  _itemTitleBlock(item, index, position) {
    return ([
      <Text
          key={'itemTitle_' + index}
          style={[
            item.titleStyle ? item.titleStyle : this.props.defaultTitleStyle,
            position === 'Bottom' ? null : styles.titleText
          ]}>
          {item.title}
      </Text>,
      item.titleInfo ?
        <Text
            key={'itemTitleInfo_' + index}
            style={[
              item.rightSideStyle ? item.rightSideStyle
              :
                position === 'Bottom' ? null : styles.rightSide,
                {color: '#B9B9B9'}, // Orig. #B1B1B1
              item.titleInfoStyle
            ]}>
            {item.titleInfo}
        </Text>
        : null
    ])
  }

  _itemView(item, index, max){
    var border;
    if(item.borderHide) {
      switch(item.borderHide) {
        case 'Top' : border = {borderBottomWidth:1, borderColor: this.props.borderColor}; break;
        case 'Bottom' : border = {borderTopWidth:1, borderColor: '#B9B9B9'}; break; // Orig this.props.borderColor
      }
    } else {
      border = index === max-1 ? {borderWidth:0} : {borderBottomWidth:1, borderColor: this.props.borderColor};
    }

    let titleInfoPosition = item.titleInfoPosition ? item.titleInfoPosition : this.props.defaultTitleInfoPosition;

    return (
      <TouchableHighlight accessible={false} key={'item_' + index} underlayColor={item.underlayColor ? item.underlayColor : this.props.underlayColor} onPress={item.onPress} onLongPress={item.onLongPress}>
        <View style={item.itemBoxStyle ? item.itemBoxStyle : [styles.itemBox, {backgroundColor: item.backgroundColor ? item.backgroundColor : this.props.backgroundColor}]}>
          {item.icon}
          {item.isAuth ?
            <View style={item.titleBoxStyle ? item.titleBoxStyle : [styles.titleBox, border]}>
              <View style={{paddingLeft:5,flexDirection:'column',flex:1}}>
                <View style={{borderBottomWidth:1,borderColor:this.props.borderColor}}>
                  <TextInput
                    ref="UserNameInputBlock"
                    onSubmitEditing={() => this.refs.PasswordInputBlock.focus()}
                    style={{flex:1,height:30, borderBottomWidth:1}}
                    placeholder = "username"
                    {...item.authPropsUser}
                  />
                </View>
                <View>
                  <TextInput
                    ref="PasswordInputBlock"
                    style={{flex:1,height:30}}
                    placeholder = "password"
                    secureTextEntry={true}
                    returnKeyType={'go'}
                    {...item.authPropsPW}
                    onSubmitEditing={() => item.onPress()}
                  />
                </View>
              </View>
            </View>
          :
          <View style={item.titleBoxStyle ? item.titleBoxStyle : [styles.titleBox, border, {minHeight:item.itemWidth ? item.itemWidth : this.props.defaultItemSize}]}>
            {titleInfoPosition === 'Bottom' ?
                <View style={{flexDirection:'column',flex:1,justifyContent:'center'}}>
                    {item.isEditable ? this._itemEditableBlock(item, inde, 'Bottom') : this._itemTitleBlock(item, index, 'Bottom')}
                </View>
              : item.isEditable ? this._itemEditableBlock(item, index) : this._itemTitleBlock(item, index)}

            {item.rightSideContent ? item.rightSideContent : null}
            {item.hasSwitch ?
              <Switch
                {...item.switchProps}
                style={styles.rightSide}
                onValueChange={(value) => item.switchOnValueChange(value)}
                value={item.switchState}/>
                : null}
            {this.itemArrowIcon(item)}
          </View>
        }
        </View>
      </TouchableHighlight>
    )
  }

  itemArrowIcon(item) {
    if(item.arrowIcon) {
        return item.arrowIcon;
    }

    if(item.hasNavArrow){
        return <Image style={[styles.rightSide, item.arrowStyle]} source={ARROW_ICON} />;
    }

    return null;
  }
}
module.exports = SettingsList;

const styles = StyleSheet.create({
  itemBox: {
    flex:1,
    justifyContent:'center',
    flexDirection:'row'
  },
  titleBox: {
    flex:1,
    marginLeft:15,
    flexDirection:'row'
  },
  titleText: {
    flex:1,
    alignSelf:'center'
  },
  rightSide: {
    marginRight:15,
    alignSelf:'center'
  },
  editableText: {
    flex: 1,
    textAlign: 'right',
    marginRight: 15
  }
});

/**
 * Optional Header for groups
 */
SettingsList.Header = React.createClass({
  propTypes: {
    headerText: React.PropTypes.string,
    headerStyle: Text.propTypes.style,
  },
  /**
   * not directly rendered
   */
  render(){
    return null;
  }
});

/**
 * Individual Items in the Settings List
 */
SettingsList.Item = React.createClass({
  propTypes: {
    /**
     * Title being displayed
     */
    title: React.PropTypes.string,
    titleStyle: Text.propTypes.style,
    /**
     * Icon displayed on the left of the settings item
     */
    icon: React.PropTypes.node,

    /**
     * Item Box Style
     */
    itemBoxStyle : View.propTypes.style,
    /**
     * Title Box Style
     */
    titleBoxStyle: View.propTypes.style,
    /**
     * Right Side Style
     */
    rightSideStyle: View.propTypes.style,
    /**
     * Editable Right Side Style
     */
    editableTextStyle: View.propTypes.style,

    /**
     * Individual item width.  Can be globally set in the parent.  Will become deprecated
     */
    itemWidth: React.PropTypes.number,
    /**
     * Allows for the item to become an auth item
     */
    isAuth: React.PropTypes.bool,
    authPropsUser: React.PropTypes.object,
    authPropsPW: React.PropTypes.object,
    /**
     * Individual background color. Can be globally set in the parent. Will become Deprecated
     */
    backgroundColor: React.PropTypes.string,

    /**
     * Individual underlay click color.  Can be globally set in the parent.
     */
    underlayColor: React.PropTypes.string,
    /**
     * Item on press callback.
     */
    onPress: React.PropTypes.func,
    /**
     * Item on long press callback.
     */
    onLongPress: React.PropTypes.func,
    /**
     * Enable or disable the > arrow at the end of the setting item.
     */
    hasNavArrow: React.PropTypes.bool,
    arrowIcon: React.PropTypes.node,

    arrowStyle: Image.propTypes.style,
    /**
     * Enable or disable a Switch component
     */
    hasSwitch: React.PropTypes.bool,
    /**
     * Switch state
     */
    switchState: React.PropTypes.bool,
    /**
     * Switch props
     */
    switchProps: React.PropTypes.object,
    /**
     * On value change callback
     */
    switchOnValueChange: React.PropTypes.func,
    /**
     * Right side information on the setting item
     */
    titleInfo: React.PropTypes.string,
    titleInfoStyle: Text.propTypes.style,
    /**
     * If 'Bottom', info is placed beneath the title
     */
    titleInfoPosition: React.PropTypes.string,
    /**
     * Right side content
     */
    rightSideContent: React.PropTypes.node,
    /* Gives opens to hide specific borders */
    borderHide: React.PropTypes.oneOf(['Top', 'Bottom', 'Both'])
  },
  getDefaultProps(){
    return {
      hasNavArrow: true
    }
  },
  /**
   * not directly rendered
   */
  render(){
    return null;
  },
});
