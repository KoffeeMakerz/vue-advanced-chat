<template>
	<div class="vac-room-container">
		<slot name="room-list-item" v-bind="{ room }">
			<div
				v-if="room.avatar"
				class="vac-avatar"
				:style="{ 'background-image': `url('${room.avatar}')` }"
			/>
			<div class="vac-name-container vac-text-ellipsis">
				<div class="vac-title-container">
					<div
						v-if="userStatus"
						class="vac-state-circle"
						:class="{ 'vac-state-online': userStatus === 'online' }"
					/>
					<div class="vac-room-name vac-text-ellipsis">
						{{ room.roomName }}
					</div>
					<div v-if="room.unreadCount" class="vac-badge-counter vac-room-badge">
						{{ room.unreadCount }}
					</div>
				</div>
				<div
					class="vac-text-last"
					:class="{
						'vac-message-new':
							room.lastMessage && room.lastMessage.new && !typingUsers
					}"
				>
					<span v-if="isMessageCheckmarkVisible">
						<slot name="checkmark-icon" v-bind="room.lastMessage">
							<svg-icon
								:name="
									room.lastMessage.distributed
										? 'double-checkmark'
										: 'checkmark'
								"
								:param="room.lastMessage.seen ? 'seen' : ''"
								class="vac-icon-check"
							/>
						</slot>
					</span>
					<div
						v-if="room.lastMessage && !room.lastMessage.deleted && isAudio"
						class="vac-text-ellipsis"
					>
						<slot name="microphone-icon">
							<svg-icon name="microphone" class="vac-icon-microphone" />
						</slot>
						{{ formattedDuration }}
					</div>
					<format-message
						v-else-if="room.lastMessage"
						:content="getLastMessage"
						:deleted="!!room.lastMessage.deleted && !typingUsers"
						:users="room.users"
						:linkify="false"
						:text-formatting="textFormatting"
						:link-options="linkOptions"
						:single-line="true"
					>
						<template #deleted-icon="data">
							<slot name="deleted-icon" v-bind="data" />
						</template>
					</format-message>
					<div
						v-if="!room.lastMessage && typingUsers"
						class="vac-text-ellipsis"
					>
						{{ typingUsers }}
					</div>
					<div class="vac-room-last-message-timestamp">
						<div class="vac-text-date">
							{{ room.lastMessage && room.lastMessage.timestamp }}
						</div>
					</div>
				</div>
			</div>
		</slot>
	</div>
</template>

<script>
import vClickOutside from 'v-click-outside'

import SvgIcon from '../../components/SvgIcon'
import FormatMessage from '../../components/FormatMessage'

import typingText from '../../utils/typing-text'
const { isAudioFile } = require('../../utils/media-file')

export default {
	name: 'RoomsContent',
	components: {
		SvgIcon,
		FormatMessage
	},

	directives: {
		clickOutside: vClickOutside.directive
	},

	props: {
		currentUserId: { type: [String, Number], required: true },
		room: { type: Object, required: true },
		textFormatting: { type: Boolean, required: true },
		linkOptions: { type: Object, required: true },
		textMessages: { type: Object, required: true }
	},

	computed: {
		getLastMessage() {
			const isTyping = this.typingUsers
			if (isTyping) return isTyping

			const content = this.room.lastMessage.deleted
				? this.textMessages.MESSAGE_DELETED
				: this.room.lastMessage.content

			if (this.room.users.length <= 2) {
				return content
			}

			const user = this.room.users.find(
				user => user._id === this.room.lastMessage.senderId
			)

			if (this.room.lastMessage.username) {
				return `${this.room.lastMessage.username} - ${content}`
			} else if (!user || user._id === this.currentUserId) {
				return content
			}

			return `${user.username} - ${content}`
		},
		userStatus() {
			if (!this.room.users || this.room.users.length !== 2) return

			const user = this.room.users.find(u => u._id !== this.currentUserId)
			if (user && user.status) return user.status.state

			return null
		},
		typingUsers() {
			return typingText(this.room, this.currentUserId, this.textMessages)
		},
		isMessageCheckmarkVisible() {
			return (
				!this.typingUsers &&
				this.room.lastMessage &&
				!this.room.lastMessage.deleted &&
				this.room.lastMessage.senderId === this.currentUserId &&
				(this.room.lastMessage.saved ||
					this.room.lastMessage.distributed ||
					this.room.lastMessage.seen)
			)
		},
		formattedDuration() {
			const file = this.room.lastMessage.file

			if (!file.duration) {
				return `${file.name}.${file.extension}`
			}

			let s = Math.floor(file.duration)
			return (s - (s %= 60)) / 60 + (s > 9 ? ':' : ':0') + s
		},
		isAudio() {
			return isAudioFile(this.room.lastMessage.file)
		}
	}
}
</script>

<style lang="scss">
.vac-room-container {
	display: flex;
	flex: 1;
	align-items: center;
	width: calc(100% - 24px);
	margin: 0px 12px;

	.vac-name-container {
		flex: 1;
	}

	.vac-title-container {
		display: flex;
		align-items: center;
		line-height: 25px;
	}

	.vac-state-circle {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background-color: var(--chat-room-color-offline);
		margin-right: 6px;
		transition: 0.3s;
	}

	.vac-state-online {
		background-color: var(--chat-room-color-online);
	}

	.vac-room-name {
		flex: 1;
		color: var(--chat-room-color-username);
		font-weight: 600;
	}

	.vac-text-date {
		margin-left: 5px;
	}

	.vac-text-last {
		display: flex;
		align-items: center;
		font-size: 12px;
		line-height: 19px;
		color: var(--chat-room-color-last-message);
		font-weight: 500;
	}

	.vac-message-new {
		color: var(--chat-room-color-username);
		font-weight: 500;
	}

	.vac-icon-check {
		display: flex;
		vertical-align: middle;
		height: 14px;
		width: 14px;
		margin-top: -2px;
		margin-right: 2px;
	}

	.vac-icon-microphone {
		height: 15px;
		width: 15px;
		vertical-align: middle;
		margin: -3px 1px 0 -2px;
		fill: var(--chat-room-color-message);
	}

	.vac-room-last-message-timestamp {
		display: flex;
		margin-left: auto;
	}

	.vac-room-badge {
		background-color: var(--chat-room-bg-color-badge);
		color: var(--chat-room-color-badge);
		margin-left: 5px;
		font-weight: 600;
	}

	.vac-list-room-options {
		height: 19px;
		width: 19px;
		align-items: center;
		margin-left: 5px;
	}
}
</style>
