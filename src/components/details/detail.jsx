import React from 'react';
import { Card, CardHeader, CardContent, Typography } from '@material-ui/core';
import useStyles from './style';

const Detail = ( { title }) => {
  const classes = useStyles();
  return (
    <Card className={title === 'Income' ? classes.income : classes.expense}>
      <CardHeader title = { title } />
      <CardContent>
        <Typography variant = 'h5' >$50</Typography>
      </CardContent>
    </Card>
  )
}

export default Detail;
