import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FeedbackFormQuestions } from "./feedbackFormQuestions";
import { User } from "./user";
import { FeedbackForm } from "./feedbackForm";

@Entity({ schema: process.env.DB_SCHEMA })
export class UserFeedback {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => FeedbackFormQuestions, (feedbackForm) => feedbackForm.userFeedback)
    @JoinColumn({ name: 'questionId' })
    feedbackFormQuestions: FeedbackFormQuestions;

    @ManyToOne(() => FeedbackForm, (feedbackForm) => feedbackForm.userFeedback)
    @JoinColumn({ name: 'feedbackId' })
    feedbackForm: FeedbackForm;

    @Column({ nullable: false })
    feedbackId: number

    @Column({ nullable: false })
    questionId: number

    @ManyToOne(() => User, (usr) => usr.userFeedback)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: false })
    userId: number

    @Column({ nullable: false })
    response: string;

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn({ nullable: true })
    updatedAt?: Date;

}