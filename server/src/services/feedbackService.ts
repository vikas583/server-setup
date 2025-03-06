import { Service } from "typedi";
import { FeedbackCaptureRequest, FeedbackFormType, UserAccountView } from "../types";
import logger from "../utils/logger";
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { dbConnection } from "../utils/dbConnection";
import { FeedbackForm } from "../entity/feedbackForm";
import { FeedbackFormQuestions } from "../entity/feedbackFormQuestions";
import { UserFeedback } from "../entity/userFeedback";

@Service()
export class FeedbackService {

    async feedbackQuestionsList(type: FeedbackFormType) {
        try {
            const dataSource = await dbConnection()

            const feedbackForm = await dataSource.getRepository(FeedbackForm).findOne({
                where: {
                    formType: type
                }
            })
            if (!feedbackForm) {
                throw new APIError('Invalid Form type!!!', RESPONSE_STATUS.NOT_FOUND)
            }

            const feedbackQuestions = await dataSource.getRepository(FeedbackFormQuestions).find({
                where: {
                    feedbackId: feedbackForm.id
                },
                select: [
                    'id',
                    'feedbackId',
                    'question',
                    'questionType',
                    'minRating',
                    'maxRating'
                ]
            })

            return feedbackQuestions
        } catch (err) {
            logger.error('Server::Service FeebackService::List')
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async captureFeedback(body: FeedbackCaptureRequest, user: UserAccountView) {
        try {
            const dataSource = await dbConnection()

            const userFeedbackArr: UserFeedback[] = []

            let feedbackId
            for (let obj of body.feedbackResp) {
                const userFeedback = new UserFeedback()
                userFeedback.questionId = obj.questionId
                userFeedback.response = obj.response
                userFeedback.userId = user.id
                userFeedback.feedbackId = obj.feedbackId

                feedbackId = obj.feedbackId

                userFeedbackArr.push(userFeedback)
            }

            const checkIfFeedbackAlreadyCaptured = await dataSource.getRepository(UserFeedback).find({
                where: {
                    userId: user.id,
                    feedbackId
                }
            })

            if (checkIfFeedbackAlreadyCaptured) {
                throw new APIError('User have already given feedback!', RESPONSE_STATUS.CONFLICT)
            }

            return await dataSource.getRepository(UserFeedback).save(userFeedbackArr)

        } catch (err) {
            logger.error('Server::Service FeebackService::capture')
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }
}