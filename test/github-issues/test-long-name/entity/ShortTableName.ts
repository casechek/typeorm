import {Column, Entity, Index, PrimaryGeneratedColumn} from "../../../../src"

@Entity()
export class ShortTableName {
    @Index('idx_short_table_name_asdfadsfadsfadsfafsgdfsgsdfgsdfgdfsgsdfgdfadfadsfasdfadfadsfasdf')
    @PrimaryGeneratedColumn() // typeORM requires a pkey
    PrimaryGeneratedColumnID: number

    @Column()
    Name: string

    @Column()
    Value: number
}
