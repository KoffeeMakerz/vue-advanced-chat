<template>
	<transition name="vac-slide-up">
		<div
			v-if="messageReply"
			class="vac-reply-container"
			:style="{ bottom: `${$parent.$refs.roomFooter.clientHeight}px` }"
		>
			<div class="vac-reply-box">
				<img
					v-if="isImageFile"
					:src="messageReply.file.url"
					class="vac-image-reply"
				/>
				<div v-else-if="!isImageFile && !isVideoFile && !isAudioFile && messageReply.file" class="vac-non-preview-reply">
					<div class="vac-non-preview-icon">
						<svg-icon name="file" />
					</div>
					<div class="vac-non-preview-content">
					<div>
						<center>{{ messageReply.file.name }}</center>
					</div>
					<div>
						<center>{{ messageReply.file.extension }}</center>
					</div>
					</div>
				</div>
				<div class="vac-reply-info">
					<div class="vac-reply-username">
						{{ messageReply.username }}
					</div>
					<div class="vac-reply-content">
						<format-message
							:content="messageReply.content"
							:users="room.users"
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

			<div class="vac-icon-reply">
				<div class="vac-svg-button" @click="$emit('reset-message')">
					<slot name="reply-close-icon">
						<svg-icon name="close-outline" />
					</slot>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
import SvgIcon from '../../components/SvgIcon'
import FormatMessage from '../../components/FormatMessage'

const { isImageFile, isVideoFile, isAudioFile } = require('../../utils/media-file')

export default {
	name: 'RoomMessageReply',
	components: {
		SvgIcon,
		FormatMessage
	},

	props: {
		room: { type: Object, required: true },
		messageReply: { type: Object, default: null },
		textFormatting: { type: Boolean, required: true },
		linkOptions: { type: Object, required: true }
	},

	computed: {
		isImageFile() {
			return isImageFile(this.messageReply.file)
		},
		isVideoFile() {
			return isVideoFile(this.messageReply.file)
		},
		isAudioFile() {
			return isAudioFile(this.messageReply.file)
		}
	}
}
</script>

<style lang="scss">
.vac-reply-container {
	position: absolute;
	display: flex;
	padding: 10px 10px 0 10px;
	background: var(--chat-footer-bg-color);
	align-items: center;
	width: calc(100% - 20px);

	.vac-reply-box {
		width: 100%;
		overflow: hidden;
		background: var(--chat-footer-bg-color-reply);
		border-radius: 4px;
		padding: 8px 10px;
		display: flex;
		max-height: 100px;
	}

	.vac-reply-info {
		overflow: hidden;
	}

	.vac-reply-username {
		color: var(--chat-message-color-reply-username);
		font-size: 12px;
		line-height: 15px;
		margin-bottom: 2px;
	}

	.vac-reply-content {
		font-size: 12px;
		color: var(--chat-message-color-reply-content);
		white-space: pre-line;
	}

	.vac-icon-reply {
		margin-left: 10px;

		svg {
			height: 20px;
			width: 20px;
		}
	}

	.vac-image-reply {
		max-height: 100px;
		margin-right: 10px;
		border-radius: 4px;
	}
}

.vac-non-preview-reply {
	max-width: 100px;
}

.vac-non-preview-icon {
	text-align: center;
}

.vac-non-preview-content {
	white-space: nowrap;
	overflow: hidden;
	font-size: 12px;
	margin: 0px 5px 0px 5px;
	color: var(--chat-message-color-reply-content);
}

@media only screen and (max-width: 768px) {
	.vac-reply-container {
		padding: 5px 8px;
		width: calc(100% - 16px);
	}
}
</style>
