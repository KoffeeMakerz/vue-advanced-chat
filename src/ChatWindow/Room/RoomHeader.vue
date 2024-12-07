<template>
	<div>
		<div class="vac-room-header">
			<slot name="room-header" v-bind="{ room, typingUsers, userStatus }">
				<div class="vac-room-wrapper">
					<div
						class="vac-info-wrapper"
						:class="{ 'vac-item-clickable': roomInfo }"
						@click="$emit('room-info')"
					>
						<slot
							name="room-header-info"
							v-bind="{ room, typingUsers, userStatus }"
						>
							<div class="vac-text-ellipsis">
								<div
									v-if="!room.isEditable"
									class="vac-room-name vac-text-ellipsis"
								>
									{{ room.roomName }}
								</div>
								<div v-else class="vac-room-name vac-text-ellipsis">
									<input
										v-if="roomNameEditing"
										type="text"
										placeholder="Room name"
										autocomplete="off"
										class="vac-room-name-input"
										v-model="temporaryRoomName"
										@keypress="$event.key === 'Enter' && changeRoomName()"
										@blur="changeRoomName"
									/>
									<div
										v-else
										class="vac-room-name-preview"
										@click="roomNameEditing = true"
									>
										{{ room.roomName }}
									</div>
								</div>
								<div v-if="typingUsers" class="vac-room-info vac-text-ellipsis">
									{{ typingUsers }}
								</div>
								<div v-else class="vac-room-info vac-text-ellipsis">
									{{ userStatus }}
								</div>
							</div>
						</slot>
					</div>
					<slot v-if="room.roomId" name="room-members"></slot>
				</div>
			</slot>
		</div>
		<div v-if="room.roomId" class="vac-tabs-container">
			<div class="vac-tabs">
				<div
					class="vac-tab"
					:class="{ active: activeTab === tabs.CHAT }"
					@click="$emit('change-tab', tabs.CHAT)"
				>
					Chat
				</div>
				<div
					class="vac-tab"
					:class="{ active: activeTab === tabs.FILES }"
					@click="$emit('change-tab', tabs.FILES)"
				>
					Files
				</div>
				<div
					class="vac-tab"
					:class="{ active: activeTab === tabs.PINNED }"
					@click="$emit('change-tab', tabs.PINNED)"
				>
					Pinned
				</div>
			</div>
			<slot name="message-search"></slot>
		</div>
	</div>
</template>

<script>
import vClickOutside from 'v-click-outside'

import SvgIcon from '../../components/SvgIcon'

import typingText from '../../utils/typing-text'

export default {
	name: 'RoomHeader',
	components: {
		SvgIcon
	},

	directives: {
		clickOutside: vClickOutside.directive
	},

	props: {
		currentUserId: { type: [String, Number], required: true },
		textMessages: { type: Object, required: true },
		singleRoom: { type: Boolean, required: true },
		showRoomsList: { type: Boolean, required: true },
		isMobile: { type: Boolean, required: true },
		roomInfo: { type: Function, default: null },
		menuActions: { type: Array, required: true },
		room: { type: Object, required: true },
		activeTab: { type: String, default: 'chat' },
		tabs: { type: Object, required: true }
	},

	watch: {
		room: {
			handler() {
				this.roomNameEditing = false
				this.temporaryRoomName = this.room.roomName
			},
			deep: true
		}
	},

	data() {
		return {
			menuOpened: false,
			temporaryRoomName: this.room.roomName,
			roomNameEditing: false
		}
	},

	computed: {
		typingUsers() {
			return typingText(this.room, this.currentUserId, this.textMessages)
		},
		userStatus() {
			if (!this.room.users || this.room.users.length !== 2) return

			const user = this.room.users.find(u => u._id !== this.currentUserId)

			if (!user.status) return

			let text = ''

			if (user.status.state === 'online') {
				text = this.textMessages.IS_ONLINE
			} else if (user.status.lastChanged) {
				text = this.textMessages.LAST_SEEN + user.status.lastChanged
			}

			return text
		}
	},

	methods: {
		menuActionHandler(action) {
			this.closeMenu()
			this.$emit('menu-action-handler', action)
		},
		closeMenu() {
			this.menuOpened = false
		},
		changeRoomName() {
			this.roomNameEditing = false
			if (this.temporaryRoomName !== this.room.roomName) {
				this.$emit('rename-room', this.temporaryRoomName)
				this.temporaryRoomName = this.room.roomName
			}
		}
	}
}
</script>

<style lang="scss">
.vac-tabs-container {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 0px 10px 0px 57px;
	gap: 20%;
	background-color: var(--chat-tabs-bg-color);
	margin-top: 10px;
	border: 1px solid rgba(71, 48, 104, 0.09);
	border-bottom: 2px solid rgba(71, 48, 104, 0.09);
	border-top-right-radius: var(--chat-container-border-radius);
	border-top-left-radius: var(--chat-container-border-radius);

	.vac-tabs {
		flex: 1;
		display: flex;
		position: relative;
		gap: 20%;
		height: 44px;
	}

	.vac-tab {
		flex: 1;
		display: flex;
		padding: 10px 20px;
		justify-content: center;
		align-items: center;
		color: #473068;
		cursor: pointer;
		transition-duration: 300ms;
		transition-property: border-bottom;
		border-bottom: unset;
	}

	.vac-tab.active {
		font-weight: 600;
		transition-duration: 300ms;
		transition-property: border-bottom;
		border-bottom: 3px solid #473068;
	}

	.vac-tab:not(.active) {
		font-weight: 400;
	}

	.vac-tab:hover {
		font-weight: 600;
	}

	.search-message-field {
		display: flex;
		width: 158px;
		height: 32px;
		border-radius: 37px;
		align-items: center;
		padding: 0px 8px;
		justify-content: space-between;
	}

	.search-icon {
		color: #7e6e95;
	}

	.search-input {
		margin-left: 5px;
	}
}
.vac-room-header {
	display: flex;
	align-items: center;
	height: 44px;
	width: 100%;
	margin-right: 1px;
	background: var(--chat-header-bg-color);
	border-radius: var(--chat-container-border-radius);
	border: 1px solid rgba(71, 48, 104, 0.09);

	.vac-room-wrapper {
		display: flex;
		align-items: center;
		min-width: 0;
		height: 100%;
		width: 100%;
		padding: 0 16px;
	}

	.vac-rotate-icon {
		transform: rotate(180deg) !important;
		margin-bottom: 27px;
	}

	.vac-info-wrapper {
		display: flex;
		align-items: center;
		min-width: 0;
		width: 100%;
		height: 100%;
		margin-bottom: 3px;
	}

	.vac-room-name {
		font-size: 18px;
		font-weight: 600;
		line-height: 22px;
		color: var(--chat-header-color-name);

		.vac-room-name-input {
			all: inherit;
			display: block;
			width: calc(100% - 40px);
			color: var(--chat-color);
			border-radius: 4px;
			font-size: 18px;
			font-weight: normal;
			outline: 0;
			caret-color: var(--chat-color-caret);
			padding: 5px 15px;
			border: 0.5px solid var(--chat-sidemenu-border-color-search);
			border-radius: 20px;
		}

		.vac-room-name-preview {
			all: inherit;
			display: block;
		}
	}

	.vac-room-info {
		font-size: 13px;
		line-height: 18px;
		color: var(--chat-header-color-info);
	}

	.vac-room-options {
		margin-left: auto;
		margin-bottom: 18px;
	}

	@media only screen and (max-width: 768px) {
		height: 50px;

		.vac-room-wrapper {
			padding: 0 10px;
		}

		.vac-room-name {
			font-size: 16px;
			line-height: 22px;
		}

		.vac-room-info {
			font-size: 12px;
			line-height: 16px;
		}

		.vac-avatar {
			height: 37px;
			width: 37px;
			min-height: 37px;
			min-width: 37px;
		}
	}
}
</style>
