import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { formatDate } from './shared/dateFormatter';
import { getDaysInMonth, getISOLocalDate } from './shared/dates';

const updateInputWidth = (element) => {
  const span = document.createElement('span');
  span.innerHTML = element.value;

  const container = element.parentElement;

  container.appendChild(span);

  const width = span.clientWidth;
  element.style.width = `${width}px`;

  container.removeChild(span);
};

export default class DateInput extends Component {
  state = {
    year: '',
    month: '',
    day: '',
  }

  componentDidMount() {
    this.updateValues();
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;

    if (
      (!!nextProps.value !== !!props.value) ||
      (nextProps.value && props.value && (nextProps.value.getTime() !== props.value.getTime()))
    ) {
      this.updateValues(nextProps);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get divider() {
    const date = new Date(2017, 11, 11);

    return formatDate(date).match(/[^0-9]/)[0];
  }

  get currentMonthMaxDays() {
    const { value } = this.props;

    if (!value) {
      return null;
    }

    return getDaysInMonth(value);
  }

  get commonInputProps() {
    return {
      type: 'number',
      onChange: this.onChange,
      required: true,
      ref: (ref) => {
        if (!ref) {
          return;
        }

        updateInputWidth(ref);
      },
    };
  }

  updateValues(props = this.props) {
    const { value } = props;

    this.setState({
      year: value ? value.getFullYear() : '',
      month: value ? value.getMonth() + 1 : '',
      day: value ? value.getDate() : '',
    });
  }

  onSubmit = (event) => {
    if (event.preventDefault) {
      event.preventDefault();
    }

    const form = event.target;

    const values = {};

    for (let i = 0; i < form.length; i += 1) {
      values[form[i].name] = form[i].value;
    }

    if (form.checkValidity()) {
      this.props.onChange(
        new Date(values.year, values.month - 1, values.day),
        false, // Prevent closing the calendar
      );
    }
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });

    updateInputWidth(event.target);

    this.onSubmit({ target: event.target.form });
  }

  onChangeNative = (event) => {
    const { value } = event.target;

    this.props.onChange(new Date(value));
  }

  renderDay() {
    const { day } = this.state;

    return (
      <input
        className="react-date-picker__button__input__day"
        name="day"
        key="day"
        min={1}
        max={this.currentMonthMaxDays}
        value={day}
        {...this.commonInputProps}
      />
    );
  }

  renderMonth() {
    const { month } = this.state;

    return (
      <input
        className="react-date-picker__button__input__month"
        name="month"
        key="month"
        min={1}
        max={12}
        value={month}
        {...this.commonInputProps}
      />
    );
  }

  renderYear() {
    const { year } = this.state;

    return (
      <input
        className="react-date-picker__button__input__year"
        name="year"
        key="year"
        min={1000}
        value={year}
        {...this.commonInputProps}
      />
    );
  }

  renderCustomInputs() {
    const { divider } = this;
    const { placeholder } = this.props;

    return (
      placeholder
        .split(divider)
        .map((part) => {
          switch (part) {
            case 'DD': return this.renderDay();
            case 'MM': return this.renderMonth();
            case 'YYYY': return this.renderYear();
            default: return null;
          }
        })
        .reduce((result, element, index, array) => {
          result.push(element);

          if (index + 1 < array.length) {
            result.push(divider);
          }

          return result;
        }, [])
    );
  }

  renderNativeInput() {
    const { value } = this.props;

    return (
      <input
        type="date"
        onChange={this.onChangeNative}
        style={{
          visibility: 'hidden',
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
        }}
        value={value ? getISOLocalDate(value) : ''}
      />
    );
  }

  render() {
    return (
      <div className="react-date-picker__button__input">
        <form onSubmit={this.onSubmit}>
          {this.renderCustomInputs()}
          {this.renderNativeInput()}
          <button type="submit" style={{ display: 'none' }} />
        </form>
      </div>
    );
  }
}

DateInput.propTypes = {
  locale: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.instanceOf(Date),
};