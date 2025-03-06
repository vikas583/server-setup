import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FeedbackFormQuestionType } from "../types";
import { FeedbackForm } from "./feedbackForm";
import { UserFeedback } from "./userFeedback";

@Entity({ schema: process.env.DB_SCHEMA })
export class FeedbackFormQuestions {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => FeedbackForm, (feedbackForm) => feedbackForm.feedbackQuestions)
    @JoinColumn({ name: 'feedbackId' })
    feedbackForm: FeedbackForm;

    @Column({ nullable: false })
    feedbackId: number

    @OneToMany(() => UserFeedback, (userFeedback) => userFeedback.feedbackFormQuestions)
    userFeedback: UserFeedback[]

    @Column({ nullable: false })
    question: string

    @Column({
        type: 'enum',
        enum: FeedbackFormQuestionType,
        nullable: false
    })
    questionType: FeedbackFormQuestionType;

    @Column({ nullable: true })
    minRating: number

    @Column({ nullable: true })
    maxRating: number

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn({ nullable: true })
    updatedAt?: Date;
}