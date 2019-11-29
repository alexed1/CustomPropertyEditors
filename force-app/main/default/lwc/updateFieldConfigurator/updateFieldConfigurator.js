import { LightningElement, api, wire, track } from 'lwc';

export default class updateFieldConfigurator extends LightningElement {
  @api supportedContextTypes;

  @track _flowVariables = [];
  @track _value;
  @track _objectId;
  @track _objectType;
  @track _fieldName;
  @track selectedField;
  @track textOption;
  @track formulaEditorVisible = false;
  @track formulaEditorMessage = 'Show Formula Editor';

  labels = {
    fieldTypeNotSupported: 'Selected field type is not supported',
    fieldValueLabel: 'Set Field Value',
    fieldNotUpdatable: 'Select field can not be updated'
  };

  customReferenceTypes = ['User'];

  _flowContext = {};
  _values = [];

  // set flowContext(flowContext) {
  //   this._flowContext = flowContext || {};
  //   if (this._flowContext) {
  //     const { variables } = this._flowContext;
  //     this._flowVariables = [...variables];
  //   }
  // }
  
  // @api get flowContext() {
  //   return this._flowContext;
  // }

  @api flowContext;

  get variablesFromFlowContext() {
    return (this.flowContext && this.flowContext.variables) || [];
  }

  set values(newValues) {
    this._values = newValues || [];

    const objectIdValue = this._values.find(({ id }) => id === 'objectId');
    this._objectId = objectIdValue && objectIdValue.value;

    const fieldNameValue = this._values.find(({ id }) => id === 'fieldName');
    if (fieldNameValue) {
        const parts = fieldNameValue.value.split('.');
        this._objectType = parts[0];
        this._fieldName = parts[1];
    }

    const formulaValue = this._values.find(({ id }) => id === 'formula');
    this._value = formulaValue && formulaValue.value;
  }

  @api get values() {
    return this._values;
  }

  @api get objectType() {
    return this._objectType;
  }

  set objectType(value) {
    this._objectType = value;
  }

  @api get fieldName() {
    return this._fieldName;
  }

  set fieldName(value) {
    this._fieldName = value;
  }

  @api get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  get textOptions() {
    let resultTextOptions = [];
    if (this.fieldProperties && !this.fieldProperties.isRequired) {
      resultTextOptions.push({ label: 'A blank value (null)', value: 'null' });
    }
    resultTextOptions.push({
      label: 'Use a formula to set the new value',
      value: 'formula_builder'
    });
    return resultTextOptions;
  }

  get checkboxOptions() {
    return [
      { label: 'True', value: 'true' },
      { label: 'False', value: 'false' }
    ];
  }

  dispatchCpeEventForObjectId(newValue = '') {
    const valueChangedEvent = new CustomEvent('valuechanged', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        id: 'objectId',
        newValue,
        newValueDataType: 'String'
      }
    });
    this.dispatchEvent(valueChangedEvent);
  }

  dispatchCpeEventForFieldName(newValue = '') {
    const valueChangedEvent = new CustomEvent('valuechanged', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        id: 'fieldName',
        newValue,
        newValueDataType: 'String'
      }
    });
    this.dispatchEvent(valueChangedEvent);
  }

  dispatchCpeEventForFormula(newValue = '') {
    const valueChangedEvent = new CustomEvent('valuechanged', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        id: 'formula',
        newValue,
        newValueDataType: 'String'
      }
    });
    this.dispatchEvent(valueChangedEvent);
  }

  handleObjectIdChange(event) {
      if (event && event.detail) {
          this._objectId = event.detail.value;
          this.dispatchCpeEventForObjectId(this._objectId);
      }
  }

  handleFieldChange(event) {
    this.selectedField = JSON.parse(JSON.stringify(event.detail));
    if (this._objectType !== this.selectedField.objectType) {
      this._objectType = this.selectedField.objectType;
    }
    if (this._fieldName !== this.selectedField.fieldName) {
      this._fieldName = this.selectedField.fieldName;
    }
    if (!this.selectedField.isInit) {
      this._value = null;
    }
    if (this._fieldName) {
        this.dispatchCpeEventForFieldName(`${this._objectType}.${this._fieldName}`);
    }
  }

  handleValueChange(event) {
    this._value = event.detail.value;
    this.dispatchCpeEventForFormula(this._value);
  }

  handleOwnerChange(event) {
    this._value = event.detail.memberId;
    // event.detail.notifyAssignee;
  }

  handleTextOptionValueChange(event) {
    this.textOption = event.detail.value;
  }

  handleSave(event) {}

  toggleFormulaEditor() {
    this.formulaEditorVisible = !this.formulaEditorVisible;
    if (this.formulaEditorVisible) {
      this.formulaEditorMessage = 'Hide Formula Editor';
    } else {
      this.formulaEditorMessage = 'Show Formula Editor';
    }
  }

  get showFormulaBuilderOption() {
    return this.textOption === 'formula_builder';
  }

  get fieldProperties() {
    if (this.selectedField && this.selectedField.fieldName) {
      return {
        ...this.selectedField,
        ...{
          isTextField:
            this.selectedField.dataType === 'String' ||
            (this.selectedField.dataType === 'Reference' &&
              !this.customReferenceTypes.some(refType =>
                this.selectedField.referenceTo.includes(refType)
              )),
          isUserReferenceField: this.selectedField.referenceTo.includes('User'),
          isBoolean: this.selectedField.dataType === 'Boolean',
          isPicklist: this.selectedField.dataType === 'Picklist',
          isDateTime: this.selectedField.dataType === 'DateTime',
          isDate: this.selectedField.dataType === 'Date',
          isCurrency: this.selectedField.dataType === 'Currency',
          isAddress: this.selectedField.dataType === 'Address',
          isDouble:
            this.selectedField.dataType === 'Double' ||
            this.selectedField.dataType === 'Int',
          isTextArea: this.selectedField.dataType === 'TextArea',
          isPhone: this.selectedField.dataType === 'Phone',
          isUrl: this.selectedField.dataType === 'Url',
          isDisabled: this.selectedField.updateable !== true,
          isRequired: this.selectedField.required === true
        }
      };
    }
    return null;
  }
}
