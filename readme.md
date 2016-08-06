# react-validated-input

- Live Demo at [http://jishun.github.io/react-validated-input/](http://jishun.github.io/react-validated-input/)
- Instance based validation component for react, NO FORMS REQUIRED!
- Supports bootstrap, can support all kinds of input in one (built in or extended)
- It uses [validate.js](http://validatejs.org/) to do the validation.

#Why -- Why another input component?
  - No! my why is, why every validation component has to base on forms? Aren't you tied of binding a form submission and calling e.preventDefault()?
  - This component uses props to control validation,
  - You can put the inputs into a form but you don't have to
  - They are grouped by the state variable which links to their 'validate' prop, don't have to align with the UI layout.
  - The validation can be triggered by the change of validate prop
  - The validation scope is set with an array of instance to validate.
  - The validation rule can be set in ways:
    * By registering a rule set with a class name as key globally.
    * By giving the rule set within the validate prop.
    * By setting the rule in the input control itself
    * Reach the end of this document for details.

## Built in types
  - text, textarea, password, email, select, radio, checkbox, file

## Installation
```bash
npm install react-validated-input --save
```
Or You can also use the standalone build by including `dist/react-validated-input.js` in your page.
If you use this, make sure you have already included React, and it is available as a global variable.

## Usage

```js
//import
import Input, * as inputHelper from 'react-validated-input'

//to render
render(){
  return <Input type="text" validate={this.state.validation} instance={this.state.user} propertyKey="email" rules={{presence: true, email: true}} placeholder="Email Address" label="Email"></Input>
}
//to validate, triggered by some button click, or certain onChange events
doValidate(){
  //if there is only one validation group, pass the defaults like this inputHelper.validate(this, [this.state.user])
  //otherwise pass the validation group name(which is the property name in t he state other than 'validation'):  inputHelper.validate(this, [this.state.user], null, 'validateContent')
  //The null above is an optional result collection, pass an empty object if you don't want your state instance to be changed
  //Support multiple group validations, pass the 4th param as an array of strings instead of a single string will do the job: as below
  inputHelper.validate(this, [this.state.user], null, ['validation', 'validateContent'])
    .then(
        () => {
          //do something when no errors
        },
        (errorMessage) => {
          //do something with the error message
        }
      )
      .catch((err) => console.log(err))
}
```
## Global Configuration
```js

import DatePicker from 'react-datepicker'
import moment from 'moment'
import * as inputHelper from 'react-validated-input'
import validator from 'validate.js'

inputHelper.config({
  validationStateProperty: 'validation', // the property name in the state object to link the validation
  useWraper: true, // uses wrappers for the input, built in wrappers are bootStrap styles
  errorCssClass : 'has-error', // the class applied when has error
  wraningCssClass : 'has-warning', // the class applied when has warning
  successCssClass : 'has-success', // the class applied when has success
  feedbackCssClass : 'has-feedback', // the class applied when has feedback
  propsPassThrough : true, // default to true, pass every props to the internal components
  mutate : false, // default to false, not allow instance to be changed by this component, set to true it will put the error indicator into the instance when validation failed,
  errorIndicatorKey : '_hasError', //the property name of the error indicator put in to the instance when mutate = true
  errorMessageKey : '_errors', //the property name of the error message collection put in to the instance when mutate = true
  classNameKey : '_class', // the property name used to find the validation className
  rulesKey : '_rules' // the property name used to find the validation rules
})

//to validate an instance of an payment method entry, here we name the class of instance as 'payMethod', the rules for the members are set this way.
inputHelper.registerClasses({
  payMethod: {
    cardNumber: {
      presence: true,
      format: {
        pattern: /^(34|37|4|5[1-5]).*$/,
        message: function(value, attribute, validatorOptions, attributes, globalOptions) {
          return validator.format("^%{num} is not a valid credit card number", {
            num: value
          });
        }
      },
    },
    name: {presence: true},
    expiration: {presence: true}
  }})
```

## Extending the types
Below code shows how to extend an input type 'datepicker' with the existing [react-datepicker](https://github.com/Hacker0x01/react-datepicker) component
```js
import DatePicker from 'react-datepicker'
import moment from 'moment'
import * as inputHelper from 'react-validated-input'

inputHelper.extend('datepicker', {
    wrapper: 'div', //the wrapper component to wrap the component, this will wrap this datepicker with bootstrap style, set to null to disable wrapping.
    wrapperClass: 'form-group',  // the className to put into the wrapper
    className: 'form-control', //the className to put into the component
    component: DatePicker, //the component reference, react class or string such as 'input'
    valueProp: 'selected', // the prop name used to assign value to the component, this date picker uses 'selected' instead of 'value'
    defaultProps: { dateFormat: 'MM/DD/YYYY' }, // the default props that the component needs
    getValueOnChange: (e, props) => e.toString(), // to internally handle the event in onChange, otherwise it will try to retrieve e.target.value
    includedLabel : false, // indicates the component does not include a label props it self, we'll renderer the label for it
    setValue: (value, props) => isNaN(Date.parse(value))? null:moment(value), //the handler to pass the value from instance to the component
    propsMap: [{from: 'placeholder', to: 'placeholderText'}] //map a different name for the default properties
})
```
### Properties
* type: (the type of the input, default 'text')
* validate: (the validation prop to manage the valiation)
* instance: (the instance that the value lays in) - required
* propertyKey: (the property name of the value member ) - required
* onChange: (standard onChange event)
* noWrap: (this overrides the global config to exclude wrapper elements while rendering)
* validationClass: (the className key which used to find the rules registered globally)
* hasError, hasWanning, hasSuccess, hasFeedback: (bootStrap styled information indicator)
* defaultValue: (default value to use in the instance if no input value)
* placeholder:
* className: (the react standard className prop, will be applied to the underlying component)
* wrapperClassName: (css calssName that will be applied to the wrapper component)
* hide: (do not render the component if true)
* options: (the options to use when the type is 'select', it can be array of strings ['options1'] or objects like [{text: 'Opt1', value: 1}])  
* label: (render a label for it with the text provided)

##API
  - validate(component, targets, results, validatePropertyKey)
    * this is a jsut helper method to help calling the nesting component's setState and wrap the callback as a promise
    * the validation will be triggered by changing the validate prop's linked member in state by setState
    * Params:
      * component: pass 'this' in the caller component to the method
      * targets: an array of the instance to validate, it will be matched with the instance set to the input to decide wheather to perform the validation
      * results: optional, an empty object used to collect the results, if pass null in, the method will make a new object as state[validatePropertyKey].results
      * validatePropertyKey: overrides the global config to tell the method which property of the state is used as the validation config, this is useful when     inputs are grouped differently
  - registerClasses(classes)
    * register a set of global validation rules
  - registerClass(className, rules)
    * set a single set of rule to validate a single class
  - config(newConfig)
    * passing a config object to change the global config
  - extend(inputType, componentConfig)
    * extend the component with adding new types of input.
    * if the input type exists, this will change the config of the type

## Managing Rules:
  - It will try to find a set of rules in the following order:
    * If the 'rules' prop is set in the component, it will gain the priority and override the global
    * it will then try instance._rules
  - If there is no rules found, the validation function will try to find a className in the following order:
    * It will use the validationClass prop if it has value.
    * it will then try instance._class
  - If it has a set of rules, it will pass it to validate.js to do the validation.
  - If it has a className, it will try to find the rules from global config made by registerClass and rgisterClasses. then use it.
  - the property name '_rules' and '_class' can be overridded with the config API method

## Extending validator
  - Please refer to the document of [validate.js](http://validatejs.org/) for the format of the rules.
  - import the validator instance to begin with
```js
  import validator from 'validate.js'
```

## Build
```bash
  npm install
  make js
```
## Contribute?
  ----- Working in Progress -----
  - Send a pull request to me
  - Or extend an input type with the extend method and publish it!
