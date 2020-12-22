import React from 'react'
import Detail  from './components/Details/Detail'
import ExpenseTracker  from './components/Main/main'
import { Grid } from '@material-ui/core';
import useStyles from './style'

const App = () => {
  const classes = useStyles();
  return (
    <div>
      <Grid className={classes.grid} container spacing={0} alignItems="center" justify="center" style={{ height: '100vh'}}>
        <Grid item xs={12} sm={4} className={classes.mobile}>
          <Detail title="Income" />
        </Grid>
        <Grid item xs={12} sm={3} className={classes.mobile}>
          <ExpenseTracker />
        </Grid>
        <Grid item xs={12} sm={4} className={classes.mobile}>
          <Detail title="Expense" />
        </Grid>
      </Grid>
    </div>
  )
}

export default App;
