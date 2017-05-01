/*!
 * react-validated-input.js 0.0.0
 *
 * (c) 2013-2015 Jishun Duan, 2013 Wrapp
 * react-validated-input.js may be freely distributed under the MIT license.
 * For all details and documentation:
 * https://github.com/Jishun/react-validated-input
 */

"use strict";
import React, { Component, PropTypes } from 'react'
import validatejs from 'validate.js'

const reservedKeys = [
  'options',
  'instance',
  'propertyKey',
  'onChange',
  'hide',
  'defaltValue',
  'wrapperClassName'
  //keyPlaceholder : 'placeholder',
  //keyType : 'type',
]

const configObj = {
  errorCssClass : 'has-error',
  wraningCssClass : 'has-warning', // the class applied when has error
  successCssClass : 'has-success', // the class applied when has error
  feedbackCssClass : 'has-feedback', // the class applied when has error
  useWrapper : true,
  propsPassThrough : true,
  allowOverride : true,
  mutate : false,
  errorIndicatorKey : '_hasError',
  classNameKey : '_class',
  rulesKey : '_rules',
  errorMessageKey : '_errors',
  validationStateProperty : 'validation'
};
const typeToComponents = {
  'text': {
    wrapper: 'div',
    className: 'form-control',
    wrapperClass: 'form-group',
    component: 'input',
    valueProp: 'value',
    defaultProps: { type: 'text'},
    defaultValue: ''
  },
  'password': {
    wrapper: 'div',
    wrapperClass: 'form-group',
    className: 'form-control',
    component: 'input',
    valueProp: 'value',
    defaultProps: { type: 'password'},
    defaultValue: ''
  },
  'email': {
    wrapper: 'div',
    wrapperClass: 'form-group',
    className: 'form-control',
    component: 'input',
    valueProp: 'value',
    defaultProps: { type: 'email'},
    defaultValue: ''
  },
  'textarea': {
    wrapper: 'div',
    wrapperClass: 'form-group',
    className: 'form-control',
    component: 'textarea',
    valueProp: 'value',
    defaultProps: {},
    defaultValue: ''
  },
  'select': {
    wrapper: 'div',
    wrapperClass: 'form-group',
    className: 'form-control',
    component: 'select',
    valueProp: 'value',
    defaultProps: {},
    defaultValue: ''
  },
  'checkbox': {
    wrapper: 'div',
    wrapperClass: 'checkbox',
    component: 'input',
    valueProp: 'checked',
    getValueOnChange: (e) => e.target.checked,
    labelAfter: true,
    defaultProps: { type: 'checkbox'},
    defaultValue: ''
    },
  'radio': {
    wrapper: 'div',
    wrapperClass: 'radio',
    component: 'input',
    valueProp: 'value',
    canuseWrapper: true,
    defaultProps: { type: 'radio'},
    labelAfter: true,
    defaultValue: ''
    },
  'file': {
    component: 'input',
    className: 'form-control',
    valueProp: null,
    defaultProps: { type: 'file'},
    defaultValue: ''
    }
}
const validationClasses = {};

export function registerClasses(classes){
  Object.assign(validationClasses, classes)
}

export function registerClass(className, rules){
  validationClasses[className] = rules
}

export function config(newConfig){
  Object.assign(configObj, newConfig);
}

export function extend(inputType, componentConfig){
  if (typeToComponents[inputType]) {
    Object.assign(typeToComponents[inputType], componentConfig)
  }else {
    typeToComponents[inputType] = componentConfig;
  }
}

export function validate(component, targets, results, validatePropertyKey){
  validatePropertyKey = validatePropertyKey || configObj.validationStateProperty;
  if (typeof(validatePropertyKey) == 'string') {
    validatePropertyKey = [validatePropertyKey];
  }
  let ret = new Promise((resolve, reject) => {
    let state = {};
    let targetHolder = {targets: targets, errorMessage: null};
    validatePropertyKey.forEach(v => {
      state[v] = targetHolder
      let holder = state[v];
      if (!results) {
        results = holder.results = {};
      }
    })

    component.setState(state, () =>{
      if (Object.keys(results).length > 0) {
        reject(results);
      }else {
        resolve(results);
      }
    })
  })
  return ret;
}

function validateInstance(instance, key, className, value, rules, config){
  if (!rules) {
    var classRule = validationClasses[className];
    if (classRule) {
      rules = classRule[key]
    }
  }
  if (rules) {
    rules = {[key]: rules}
    let ret = validatejs(instance, rules);
    if (ret) {
      let result = {[config.errorIndicatorKey]: true, [config.errorMessageKey] : ret};
      if (config.mutate) {
        Object.assign(instance, result);
      }
      return ret;
    }
  }
}

export default class ValidatedInput extends Component {

  constructor(props){
    super(props);
    this.state = {value: this.getValue(), hasError: false};
    this.config = configObj.allowOverride ? Object.assign({}, configObj) : configObj;
  }

  componentWillReceiveProps(newProps){
    if (newProps.validate) {
      let hasError = false;
      let {instance, propertyKey} = this.props;
      if (newProps.validate && newProps.validate.targets && newProps.validate.targets.length > 0) {
        newProps.validate.targets.forEach(v => {
          if (v === instance) {
            let result = this.validate(newProps, this.state.value);
            if (result) {
              hasError = true;
              Object.assign(this.props.results || newProps.validate.results, result);
            }
          }
        });
      }
      instance._hasError |= hasError;
      if (this.state.hasError != hasError) {
        this.setState({hasError:hasError});
      }
    }
  }

  validate(newProps, value){
    let className = this.props.validationClass || newProps.instance[this.config.classNameKey]
    let rules = this.props.rules || newProps.instance[this.config.rulesKey]
    if(this.props.required)
    {
      rules.presence = true
    }
    return validateInstance(newProps.instance, newProps.propertyKey, className, value, rules, this.config);
  }

  mapOptions(o, i){
    if (typeof(o) == 'string') {
      return <option key={i} value={o}>{o}</option>;
    }
    return (<option key={i} value={o.value} className={o.className || ''} style={o.style || ''}>{o.text || o.value}</option>);
  }

  handleChange(instance, propertyKey, callback, e) {
    let value = this.compConfig.getValueOnChange ? this.compConfig.getValueOnChange(e, this.props) : e.target.value;
     this.setState({value: value});
     if(callback){
       callback(e, value);
     }
     if(!callback || this.config.mutate) {
       instance[propertyKey] = value;
     }
  }

  getOptionsFromProps(props){
    if (!configObj.allowOverride) {
      return;
    }
    this.config.propsPassThrough = this.props.passThrough ? true : this.config.propsPassThrough;
    //required, number, digits, type, instance, propertyKey, defaultValue, placeholder, onChange, hide, options, hasError, hasWanning, hasSuccess, hasFeedback, noWrap, label, validate, validationClass
  }

  getValue(){
    this.compConfig = this.compConfig || typeToComponents[this.props.type];
    if (!this.compConfig) {
        throw 'must specify the type of the input, example: type="text" '
    }
    var ret = this.props.instance[this.props.propertyKey];
    if (ret == undefined || ret == null) {
      return this.props.defaultValue;
    }
    return ret;
  }

  render(){
    if (this.props[this.config.keyHide] === true) {
      return null;
    }

    let value = this.getValue();
    value = this.compConfig.setValue ? this.compConfig.setValue(value, this.props) : value;
    let {type, instance, propertyKey, onChange, defaultValue} = this.props;

    let props = Object.assign({onChange: this.handleChange.bind(this, instance, propertyKey, onChange)}, this.compConfig.defaultProps);

    props[this.compConfig.valueProp] = value == null? this.compConfig.defaultValue: value;

    if (this.config.propsPassThrough) {
      Object.keys(this.props).forEach(k => {
        if (!reservedKeys.some(r => r === k)) {
          props[k] = this.props[k];
        }
      })
    }else {
      props.placeholder = this.props.placeholder;
      props.type = this.props.type;
    }
    let stateProps = {className : props.className || ''};
    if (this.state.hasError || this.props.hasError) {
      stateProps.className += (' ' + this.config.errorCssClass)
    }else if(this.props.hasWarning){
      stateProps.className += (' ' + this.config.warningCssClass)
    }else if(this.props.hasSuccess){
      stateProps.className += (' ' + this.config.successCssClass)
    }else if(this.props.hasFeedback ){
      stateProps.className += (' ' + this.config.feedbackCssClass)
    }
    let children = null;
    if (type == 'select') {
      children = this.props.options.map(this.mapOptions)
    }
    return this.finalRender(props, stateProps, this.props.label, children)
  }

  getInputType(){
    return this.props.type || 'text';
  }

  cleanUpProps(props){


  }

  finalRender(props, stateProps, label, children){
    let useWraper = this.config.useWrapper && this.compConfig.wrapper && !this.props.noWrap;
    delete props.validate
    delete props.rules
    if (!useWraper) {
      Object.assign(props, stateProps);
    }
    props.className = (props.className || '') + ' ' + (this.compConfig.className || '')
    if (this.compConfig.propsMap) {
      this.compConfig.propsMap.forEach(p => props[p.to] = props[p.from])
    }
    let Comp = this.compConfig.component;
    var toRender;
    if (this.compConfig.includedLabel) {
      props.label = label;
      toRender = children ? <Comp {...props}>{children}</Comp> : <Comp {...props}/>
    }else {
      toRender = this.compConfig.labelAfter
        ? <span>{children ? <Comp {...props}>{children}</Comp> : <Comp {...props}/>}<span>{label}</span></span>
        : <span><span>{label}</span>{children ? <Comp {...props}>{children}</Comp> : <Comp {...props}/>}</span>
    }
    if (useWraper) {
      stateProps.className = (stateProps.className || '') +  ' ' + (this.compConfig.wrapperClass || '') + ' ' + (this.props.wrapperClassName || '')
      let Wrapper = this.compConfig.wrapper
      return <Wrapper {...stateProps}>
        {toRender}
      </Wrapper>
    }
    return toRender
  }
}

ValidatedInput.propTypes = {
  instance: PropTypes.object.isRequired,
  propertyKey: PropTypes.string.isRequired
}
