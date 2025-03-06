import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FeedbackFormType } from "../types";
import { FeedbackFormQuestions } from "./feedbackFormQuestions";
import { UserFeedback } from "./userFeedback";

@Entity({ schema: process.env.DB_SCHEMA })
export class FeedbackForm {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'enum',
        enum: FeedbackFormType,
        nullable: false,
        unique: true
    })
    formType: FeedbackFormType;

    @OneToMany(() => UserFeedback, (userFeedback) => userFeedback.feedbackForm)
    userFeedback: UserFeedback[]

    @OneToMany(() => FeedbackFormQuestions, (feedbackFormQuestions) => feedbackFormQuestions.feedbackForm)
    feedbackQuestions: FeedbackFormQuestions[]

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn({ nullable: true })
    updatedAt?: Date;
}