import { createConnection, getConnection, getConnectionOptions } from 'typeorm';

const connection = {
  async create(){
    const defaultOptions = await getConnectionOptions()

    return createConnection(
      Object.assign(defaultOptions, {
        migrationsRun: process.env.NODE_ENV === 'test',
        database: process.env.NODE_ENV === 'test'
          ? 'fin_api_test'
          : defaultOptions.database
      })
    );
  },

  async close(){
    await getConnection().close();
  },

  async clear(){
    const connection = getConnection();
    const entities = connection.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = connection.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  },
};
export default connection;
