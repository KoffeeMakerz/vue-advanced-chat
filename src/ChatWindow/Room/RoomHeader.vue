<template>
	<div>
		<div class="vac-room-header vac-app-border-b">
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
									<div class="vac-room-name-preview">{{ room.roomName }}</div>
									<input
										type="text"
										placeholder="Room name"
										autocomplete="off"
										class="vac-room-name-input"
										@input="$emit('rename-room', $event)"
									/>
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
				<div class="vac-tabs-slider"></div>
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

	data() {
		return {
			menuOpened: false
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
	padding: 0px 16px 0px 57px;
	gap: 20%;
	background-color: var(--chat-tabs-bg-color);

	.vac-tabs {
		flex: 1;
		display: flex;
		position: relative;
		gap: 20%;
		height: 55px;
	}

	.vac-tabs-slider {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 3px;
		width: calc((100% - 40%) / 3);
		background-color: #473068;
		transition: transform 0.3s ease;
	}
	.vac-tab {
		flex: 1;
		display: flex;
		padding: 10px 20px;
		justify-content: center;
		align-items: center;
		color: #473068;
		cursor: pointer;
		transition: color 0.3s ease;
	}

	.vac-tab.active {
		font-weight: 600;
	}

	.vac-tab:not(.active) {
		font-weight: 400;
	}

	.vac-tab:hover {
		font-weight: 600;
	}

	.vac-tabs .vac-tab:nth-child(1).active ~ .vac-tabs-slider {
		transform: translateX(0px);
	}

	.vac-tabs .vac-tab:nth-child(2).active ~ .vac-tabs-slider {
		transform: translateX(200%);
	}

	.vac-tabs .vac-tab:nth-child(3).active ~ .vac-tabs-slider {
		transform: translateX(400%);
	}

	.search-message-field {
		display: flex;
		width: 158px;
		height: 32px;
		border-radius: 37px;
		align-items: center;
		padding: 0px 8px;
		justify-content: space-between;
		margin-bottom: 15px;
	}

	.search-icon {
		color: #7e6e95;
	}

	.search-input {
		margin-left: 5px;
	}
}
.vac-room-header-container {
	position: absolute;
	z-index: 10;
	width: 100%;
}
.vac-room-header {
	display: flex;
	align-items: center;
	height: 64px;
	width: 100%;
	margin-right: 1px;
	background: var(--chat-header-bg-color);
	border-top-right-radius: var(--chat-container-border-radius);
	box-shadow: 0px 3px 6px rgba(71, 48, 104, 0.06);

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
		font-size: 17px;
		font-weight: 500;
		line-height: 22px;
		color: var(--chat-header-color-name);

		.vac-room-name-input {
			all: inherit;
			display: none;
		}

		.vac-room-name-preview {
			all: inherit;
			display: block;
		}

		&:hover {
			.vac-room-name-input {
				display: block;
				width: calc(100% - 20px);
				background: var(--chat-search-color);
				color: var(--chat-color);
				border-radius: 4px;
				font-size: 15px;
				outline: 0;
				caret-color: var(--chat-color-caret);
				padding: 5px;
				border: 0.5px solid var(--chat-sidemenu-border-color-search);
				border-radius: 20px;
			}
			.vac-room-name-preview {
				display: none;
			}
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
