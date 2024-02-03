import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MonthlyLimitsNotifications {
	sendLimitReachedEmail(userName: string, userEmail: string) {
		console.log(`email sent`);
		const transporter = this.createTransport(
			`${process.env.EMAIL_FROM}`,
			`${process.env.EMAIL_APP_PASSWORD}`,
		);
		const mailOptions = this.generateLimitReachedMailOptions(userName, userEmail);
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});
	}

	createTransport(from: string, password: string) {
		return nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: from,
				pass: password,
			},
		});
	}

	generateLimitReachedMailOptions(userName: string, userEmail: string) {
		return {
			from: 'sparolem234@gmail.com',
			to: userEmail,
			subject: 'Sending Email using Node.js',
			text:
				`Dear ${userName}. We would like to notify you that you have exceeded the established` +
				` spending limit in Finance Management App`,
		};
	}
}
