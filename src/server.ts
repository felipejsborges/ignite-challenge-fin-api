import { app } from './app';
import connection from './database';

connection.create()

app.listen(3333, () => { console.log('Server is running') });
