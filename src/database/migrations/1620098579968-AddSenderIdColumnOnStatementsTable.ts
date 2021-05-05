import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddTargetIdColumnOnStatementsTable1620098579968 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('statements', new TableColumn({
      name: 'target_id',
      type: 'uuid',
      isNullable: true
    }))
    await queryRunner.createForeignKey('statements', new TableForeignKey({
      name: 'statementTarget',
      columnNames: ['target_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('statements', 'statementTarget')
    await queryRunner.dropColumn('statements', 'target_id')
  }
}
