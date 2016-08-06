import React from 'react'
import ReactDom from 'react-dom'
import Input, * as inputHelper from '../src/index'

import './css/bootstrap/bootstrap.min.css'
import './css/site.css'

//optional: setting up global config -- begin
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

// -- end


//additional code needed to enable supporting of datepicker -- begin

import DatePicker from 'react-datepicker'
import moment from 'moment'
import validator from 'validate.js'

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

validator.extend(validator.validators.datetime, {
  parse: function(value, options) {
    return +moment.utc(value);
  },
  format: function(value, options) {
    var format = options.dateOnly ? "MM/DD/YYYY" : "MM/DD/YYYY hh:mm:ss";
    return moment.utc(value).format(format);
  }
});
//additional code needed to enable supporting of datepicker -- end

//register some global validation rules -- begin
inputHelper.registerClasses({
  ExampleTestTarget: {
    textarea: {presence: true},
    select: {presence: true, format: /^[1,3]$/},
    datetime: {datetime: true, presence: true}
    }
  }
)
// -- end

//Example component
class BasicInputTest extends React.Component {

    constructor(){
      super()
      this.state= {target: {_class:"ExampleTestTarget", text:"", select:"2",  checkbox:true, test:0, radio: "2"}, validation: {}, group2: {}}
    }

    doValidate1(){
      inputHelper.validate(this, [this.state.target])
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

    doValidate2(){
      inputHelper.validate(this, [this.state.target], null, ["group2"])
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

    doValidateAll(){
      inputHelper.validate(this, [this.state.target], null, ["validation", "group2"])
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

    clear(){
      this.setState({validation:{}, group2:{}})
    }

    render(){

      return <div className="container">
        <Input type="text" placeholder="text" label="text (Group 1)" rules={{presence:true}} instance={this.state.target} propertyKey="text" validate={this.state.validation} />
        <Input type="email" placeholder="select" label="email (Group 1)" rules={{presence:true, email:true}} instance={this.state.target} propertyKey="email" validate={this.state.validation} />
        <Input type="password" placeholder="password" label="password (Group 1)" rules={{presence:true}} instance={this.state.target} propertyKey="password" validate={this.state.validation} />
        <Input type="select" placeholder="select" label="select (Group 2, using global class rules)"  instance={this.state.target} propertyKey="select" options={[{text:"Option1", value: 1}, {text:"Option2", value: 2}]} validate={this.state.group2} />
        <Input type="textarea" placeholder="textarea" label="textarea (Group 2, using global class rules)"  instance={this.state.target} propertyKey="textarea" validate={this.state.group2} />
        <Input type="datepicker" noWrap placeholder="datepicker" label="Extened Datepicker (Group 2, using global class rules)"  instance={this.state.target} propertyKey="datetime" validate={this.state.group2} />
        <br/>
        <Input type="checkbox" label="checkbox" instance={this.state.target} propertyKey="checkbox" validate={this.state.validation} />
        <Input type="radio" label="raidio_1" name="Radio" value="1" rules={{presence:true}} instance={this.state.target} propertyKey="radio" validate={this.state.validation} />
        <span/>
        <Input type="radio" label="raidio_2" name="Radio" value="2" rules={{presence:true}} instance={this.state.target} propertyKey="radio" validate={this.state.validation} />
        <br/>
        <button onClick={this.doValidate1.bind(this)}>Validate Group 1</button> <span>&nbsp;</span>
        <button onClick={this.doValidate2.bind(this)}>Validate Group 2</button> <span>&nbsp;</span>
        <button onClick={this.doValidateAll.bind(this)}>Validate All</button> <span>&nbsp;</span>
        <button onClick={this.clear.bind(this)}>Clear</button> <span>&nbsp;</span>
      </div>
    }
}


class InputTest extends React.Component {

  constructor(){
    super()
  }

  render(){
    return <div>
      <h2><a target="_blank" href="https://github.com/Jishun/react-validated-input">react-validated-input</a></h2>
      <h3>Examples (<a target="_blank" href="https://github.com/Jishun/react-validated-input/blob/master/project/test/entry.js">View Source code</a>):</h3>
      <BasicInputTest/>
    </div>
  }
}

ReactDom.render(<InputTest/>,  document.getElementById('content'));
