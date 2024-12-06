<template>
	<div
		v-show="showRoomsList"
		class="vac-rooms-container vac-app-border-r"
		:class="{ 'vac-rooms-container-full': isMobile }"
	>
		<loader :show="loadingRooms" />

		<div
			v-for="(group, groupIndex) in groupRooms"
			:key="group.id"
			class="vac-room-group-container"
			:class="{
				'vac-room-group-container-expanded': expandedGroups.includes(group.id)
			}"
		>
			<div v-if="!loadingRooms" class="vac-room-header-container">
				<div class="vac-room-details-container">
					<div class="vac-room-name" @click="toggleGroupExpand(group.id)">
						{{ group.name }}
					</div>
					<div class="vac-group-expand" @click="toggleGroupExpand(group.id)">
						<svg-icon v-if="expandedGroups.includes(group.id)" name="dropup" />
						<svg-icon v-else name="dropdown" />
					</div>
					<div
						v-if="group.unreadCount"
						class="vac-badge-counter vac-room-badge"
					>
						{{ group.unreadCount }}
					</div>
				</div>
				<div
					v-if="group.showAddRoom"
					class="vac-svg-button vac-add-icon"
					@click="$emit('add-room')"
				>
					<slot name="add-icon">
						<svg-icon name="add" />
					</slot>
				</div>
			</div>

			<div
				v-if="
					!loadingRooms && !rooms.length && expandedGroups.includes(group.id)
				"
				class="vac-rooms-empty"
			>
				<slot name="rooms-empty">
					{{ textMessages.ROOMS_EMPTY }}
				</slot>
			</div>

			<div
				v-if="!loadingRooms && expandedGroups.includes(group.id)"
				class="vac-room-list"
			>
				<div
					v-for="fRoom in groupRooms[groupIndex].rooms"
					:id="fRoom.roomId"
					:key="fRoom.roomId"
					class="vac-room-item"
					:class="{ 'vac-room-selected': selectedRoomId === fRoom.roomId }"
					@click="openRoom(fRoom)"
				>
					<room-content
						:current-user-id="currentUserId"
						:room="fRoom"
						:text-formatting="textFormatting"
						:link-options="linkOptions"
						:text-messages="textMessages"
						:room-actions="roomActions"
						@room-action-handler="$emit('room-action-handler', $event)"
					>
						<template v-for="(i, name) in $scopedSlots" #[name]="data">
							<slot :name="name" v-bind="data" />
						</template>
					</room-content>
				</div>
				<transition name="vac-fade-message">
					<infinite-loading
						v-if="rooms.length && !loadingRooms"
						force-use-infinite-wrapper=".vac-room-list"
						web-component-name="vue-advanced-chat"
						spinner="spiral"
						@infinite="loadMoreRooms"
					>
						<div slot="spinner">
							<loader :show="true" :infinite="true" />
						</div>
						<div slot="no-results" />
						<div slot="no-more" />
					</infinite-loading>
				</transition>
			</div>
		</div>
	</div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading'

import Loader from '../../components/Loader'

import RoomsSearch from './RoomsSearch'

import RoomContent from './RoomContent'

import SvgIcon from '../../components/SvgIcon'

export default {
	name: 'RoomsList',
	components: {
		InfiniteLoading,
		Loader,
		RoomsSearch,
		RoomContent,
		SvgIcon
	},

	props: {
		currentUserId: { type: [String, Number], required: true },
		textMessages: { type: Object, required: true },
		showRoomsList: { type: Boolean, required: true },
		showAddRoom: { type: Boolean, required: true },
		textFormatting: { type: Boolean, required: true },
		linkOptions: { type: Object, required: true },
		isMobile: { type: Boolean, required: true },
		rooms: { type: Array, required: true },
		loadingRooms: { type: Boolean, required: true },
		roomsLoaded: { type: Boolean, required: true },
		room: { type: Object, required: true },
		roomActions: { type: Array, required: true },
		roomTypes: { type: Array, required: true }
	},

	data() {
		return {
			groupRooms: [],
			infiniteState: null,
			loadingMoreRooms: false,
			selectedRoomId: '',
			expandedGroups: []
		}
	},

	watch: {
		rooms: {
			handler(newVal, oldVal) {
				this.filteredRooms = this.extractRooms(newVal)

				if (
					this.infiniteState &&
					(newVal.length !== oldVal.length || this.roomsLoaded)
				) {
					this.infiniteState.loaded()
					this.loadingMoreRooms = false
				}
			},
			immediate: true
		},
		loadingRooms(val) {
			if (val) this.infiniteState = null
		},
		loadingMoreRooms(val) {
			this.$emit('loading-more-rooms', val)
		},
		roomsLoaded(val) {
			if (val && this.infiniteState) {
				this.loadingMoreRooms = false
				this.infiniteState.complete()
			}
		},
		room: {
			immediate: true,
			handler(val) {
				if (val && !this.isMobile) this.selectedRoomId = val.roomId
			}
		},
		selectedRoomId: {
			immediate: true,
			handler(val) {
				if (val) {
					const groupId = this.groupRooms.find(group =>
						group.rooms.find(room => room.roomId === val)
					)
					if (groupId && !this.expandedGroups.includes(groupId.id)) {
						this.expandedGroups.push(groupId.id)
					}
				}
			}
		}
	},

	methods: {
		openRoom(room) {
			if (room.roomId === this.room.roomId && !this.isMobile) return
			if (!this.isMobile) this.selectedRoomId = room.roomId
			this.$emit('fetch-room', { room })
		},
		toggleGroupExpand(groupId) {
			if (this.expandedGroups.includes(groupId)) {
				this.expandedGroups = this.expandedGroups.filter(id => id !== groupId)
			} else {
				this.expandedGroups.push(groupId)
			}
		},
		loadMoreRooms(infiniteState) {
			if (this.loadingMoreRooms) return

			if (this.roomsLoaded) {
				this.loadingMoreRooms = false
				return infiniteState.complete()
			}

			this.infiniteState = infiniteState
			this.$emit('fetch-more-rooms')
			this.loadingMoreRooms = true
		},
		extractRooms(rooms) {
			this.groupRooms = this.roomTypes.map(type => {
				const group = rooms.filter(room => room.type === type.type)
				return { ...type, rooms: group }
			})
		}
	}
}
</script>

<style lang="scss">
.vac-rooms-container {
	display: flex;
	flex-flow: column;
	flex: 0 0 25%;
	min-width: 260px;
	max-width: 500px;
	position: relative;
	background: var(--chat-sidemenu-bg-color);
	height: 100%;
	border-top-left-radius: var(--chat-container-border-radius);
	border-bottom-left-radius: var(--chat-container-border-radius);
	box-shadow: 5px 3px 6px rgba(71, 48, 104, 0.06);
	z-index: 1;
	overflow-y: auto;
	padding-top: 10px;

	&.vac-rooms-container-full {
		flex: 0 0 100%;
		max-width: 100%;
	}

	.vac-add-icon {
		margin-left: auto;
		padding: 0px 10px;
	}

	.vac-room-group-container {
		position: relative;
	}

	.vac-room-group-container-expanded {
		margin-bottom: 10px;
	}

	.vac-room-header-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 44px;
		margin: 0px 10px 10px;
		background: var(--chat-header-bg-color);
		width: calc(100% - 20px);
		margin-bottom: 10px;

		.vac-room-details-container {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			padding: 0 15px;
			gap: 10px;
		}

		.vac-room-name {
			color: #473068;
			font-weight: 600;
			cursor: pointer;
		}

		.vac-group-expand {
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.vac-room-badge {
			background-color: var(--chat-room-bg-color-badge);
			color: var(--chat-room-color-badge);
			margin-left: 5px;
			font-weight: 600;
		}
	}

	.vac-rooms-empty {
		font-size: 14px;
		color: #9ca6af;
		font-style: italic;
		text-align: center;
		margin: 40px 0;
		line-height: 20px;
		white-space: pre-line;
	}

	.vac-room-list {
		position: relative;
		max-width: 100%;
		cursor: pointer;
	}

	.vac-room-item {
		// border-radius: 8px;
		align-items: center;
		display: flex;
		flex: 1 1 100%;
		margin-bottom: 5px;
		margin: 0 10px 5px;
		position: relative;
		min-height: 65px;

		&:hover {
			background: var(--chat-sidemenu-room-bg-active) !important;
		}

		&:not(:hover) {
			background: var(--chat-sidemenu-room-bg);
		}
	}

	.vac-room-selected {
		color: var(--chat-sidemenu-color-active) !important;
		background: var(--chat-sidemenu-room-bg-active) !important;
	}

	@media only screen and (max-width: 768px) {
		.vac-room-list {
			padding: 0 7px 5px;
		}

		.vac-room-item {
			min-height: 60px;
			padding: 0 8px;
		}
	}
}
</style>
