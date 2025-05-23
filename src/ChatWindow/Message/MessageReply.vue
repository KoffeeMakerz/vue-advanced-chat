<template>
	<div
		class="vac-reply-message"
		@click="showReplyMessage(message.replyMessage)"
	>
		<div
			class="vac-reply-message vac-reply-message-container"
			:class="{
				'vac-reply-message-container-me': message.senderId === currentUserId
			}"
		>
			<div class="vac-reply-username">
				{{ replyUsername }}
			</div>

			<div v-if="isImage" class="vac-image-reply-container">
				<div
					class="vac-message-image vac-message-image-reply"
					:style="{
						'background-image': `url('${message.replyMessage.file.url}')`
					}"
				/>
			</div>

			<div v-else-if="isVideo" class="vac-video-reply-container">
				<video width="100%" height="100%" controls>
					<source :src="message.replyMessage.file.url" />
				</video>
			</div>

			<audio-player
				v-else-if="isAudio"
				:src="message.replyMessage.file.url"
				@update-progress-time="progressTime = $event"
				@hover-audio-progress="hoverAudioProgress = $event"
			>
				<template v-for="(i, name) in $scopedSlots" #[name]="data">
					<slot :name="name" v-bind="data" />
				</template>
			</audio-player>

			<div
				v-else-if="message.replyMessage.file"
				class="vac-image-reply-container"
			>
				<div
					class="vac-reply-content"
					:class="{
						'vac-reply-content-me': message.senderId === currentUserId
					}"
				>
					<div>
						<div style="text-align: center">
							<svg-icon name="file" />
						</div>
						<div style="white-space: nowrap; overflow: hidden">
							<center>{{ message.replyMessage.file.name }}</center>
						</div>
						<div>
							<center>{{ message.replyMessage.file.extension }}</center>
						</div>
						<hr v-if="message.replyMessage.content" />
					</div>
				</div>
			</div>

			<div
				class="vac-reply-content"
				:class="{ 'vac-reply-content-me': message.senderId === currentUserId }"
			>
				<format-message
					:content="message.replyMessage.content"
					:users="roomUsers"
					:text-formatting="textFormatting"
					:link-options="linkOptions"
					:reply="true"
				>
					<template v-for="(i, name) in $scopedSlots" #[name]="data">
						<slot :name="name" v-bind="data" />
					</template>
				</format-message>
			</div>
		</div>
	</div>
</template>

<script>
import SvgIcon from '../../components/SvgIcon'
import FormatMessage from '../../components/FormatMessage'
import AudioPlayer from './AudioPlayer'

const {
	isAudioFile,
	isImageFile,
	isVideoFile
} = require('../../utils/media-file')

export default {
	name: 'MessageReply',
	components: { SvgIcon, AudioPlayer, FormatMessage },

	props: {
		message: { type: Object, required: true },
		textFormatting: { type: Boolean, required: true },
		linkOptions: { type: Object, required: true },
		roomUsers: { type: Array, required: true },
		currentUserId: { type: [String, Number], required: true }
	},

	computed: {
		replyUsername() {
			const { senderId } = this.message.replyMessage
			const replyUser = this.roomUsers.find(user => user._id === senderId)
			return replyUser ? replyUser.username : ''
		},
		isAudio() {
			return isAudioFile(this.message.replyMessage.file)
		},
		isImage() {
			return isImageFile(this.message.replyMessage.file)
		},
		isVideo() {
			return isVideoFile(this.message.replyMessage.file)
		}
	},

	methods: {
		showReplyMessage(message) {
			this.$emit('show-reply-message', message)
		}
	}
}
</script>

<style lang="scss">
.vac-reply-message {
	background: white;
	border-radius: 4px;
	cursor: pointer;

	.vac-reply-message-container {
		background: var(--chat-message-bg-color-reply);
		margin: -1px -5px 8px;
		padding: 8px 10px;
	}

	.vac-reply-message-container-me {
		background: var(--chat-message-bg-color-reply-me);
	}

	.vac-reply-username {
		color: var(--chat-message-color-reply-username);
		font-size: 12px;
		line-height: 15px;
		margin-bottom: 2px;
	}

	.vac-image-reply-container {
		width: 70px;

		.vac-message-image-reply {
			height: 70px;
			width: 70px;
			margin: 4px auto 3px;
		}
	}

	.vac-video-reply-container {
		width: 200px;
		max-width: 100%;

		video {
			border-radius: 4px;
		}
	}

	.vac-reply-content {
		font-size: 12px;
		color: var(--chat-message-color-reply-content);
	}

	.vac-reply-content-me {
		color: var(--chat-message-color-reply-content-me);
	}
}
</style>
