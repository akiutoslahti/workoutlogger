import React from 'react'
import { Form, Button } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const LoginForm = ({
  fieldChangeHandler,
  loginHandler,
  username,
  password
}) => (
  <div>
    <h2>Log in to workout logger app</h2>
    <Form onSubmit={loginHandler}>
      <Form.Field>
        <label htmlFor="username">
          username
          <input
            name="username"
            id="username"
            type="text"
            value={username}
            onChange={fieldChangeHandler}
          />
        </label>
      </Form.Field>
      <Form.Field>
        <label htmlFor="password">
          password
          <input
            name="password"
            id="password"
            type="password"
            value={password}
            onChange={fieldChangeHandler}
          />
        </label>
      </Form.Field>
      <Button type="submit">log in</Button>
    </Form>
  </div>
)

LoginForm.propTypes = {
  fieldChangeHandler: PropTypes.func.isRequired,
  loginHandler: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired
}

export default LoginForm
