import React from 'react';
import { Card, CardHeader, CardContent, Typography } from '@material-ui/core';
import Form from './Form/Form'
// import useStyles from './styles;

const ExpenseTracker = () => {
  // const classes = useStyles();
  return (
    <Card>
      <CardHeader title = 'Expense Tracker' />
      <CardContent>
        <Typography align = 'center' variant="h5">Total Balance $100</Typography>
      </CardContent>
      <CardContent>
        <Form />
      </CardContent>
      <CardContent className={classes.cartContent}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <List />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ExpenseTracker;
