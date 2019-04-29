import express from 'express';
import articleRoutes from './api/articles';
import authentication from './api/authentication';
import searchRoute from './api/searchRoute';

const app = express();

app.use('/auth', authentication);
app.use('/articles', articleRoutes);
app.use('/search', searchRoute);

export default app;
