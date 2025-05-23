<template>
	<div
		class="vac-format-message-wrapper"
		:class="{ 'vac-text-ellipsis': singleLine }"
	>
		<div v-if="textFormatting" :class="{ 'vac-text-ellipsis': singleLine }">
			<template v-for="(message, i) in linkifiedMessage">
				<component
					:is="message.url ? 'a' : 'span'"
					:key="i"
					:class="{
						'vac-text-ellipsis': singleLine,
						'vac-text-bold': message.bold,
						'vac-text-italic': deleted || message.italic,
						'vac-text-strike': message.strike,
						'vac-text-underline': message.underline,
						'vac-text-inline-code': !singleLine && message.inline,
						'vac-text-multiline-code': !singleLine && message.multiline,
						'vac-text-tag': !singleLine && !reply && message.tag
					}"
					:href="message.href"
					:target="message.href ? linkOptions.target : null"
					@click="openTag(message)"
				>
					<slot name="deleted-icon" v-bind="{ deleted }">
						<svg-icon v-if="deleted" name="deleted" class="vac-icon-deleted" />
					</slot>
					<template v-if="message.url && message.image">
						<div class="vac-image-link-container">
							<div
								class="vac-image-link"
								:style="{
									'background-image': `url('${message.value}')`,
									height: message.height
								}"
							/>
						</div>
						<div class="vac-image-link-message">
							<span>{{ message.value }}</span>
						</div>
					</template>
					<template v-else>
						<span>{{ message.value }}</span>
					</template>
				</component>
			</template>
		</div>
		<div v-else>
			{{ formattedContent }}
		</div>
	</div>
</template>

<script>
import SvgIcon from './SvgIcon'

import formatString from '../utils/format-string'
import { IMAGE_TYPES } from '../utils/constants'

export default {
	name: 'FormatMessage',
	components: { SvgIcon },

	props: {
		content: { type: [String, Number], required: true },
		deleted: { type: Boolean, default: false },
		users: { type: Array, default: () => [] },
		linkify: { type: Boolean, default: true },
		singleLine: { type: Boolean, default: false },
		reply: { type: Boolean, default: false },
		textFormatting: { type: Boolean, required: true },
		linkOptions: { type: Object, required: true }
	},

	computed: {
		linkifiedMessage() {
			const message = formatString(
				this.formatTags(this.content),
				this.linkify && !this.linkOptions.disabled,
				this.linkOptions
			)

			message.forEach(m => {
				m.url = this.checkType(m, 'url')
				m.bold = this.checkType(m, 'bold')
				m.italic = this.checkType(m, 'italic')
				m.strike = this.checkType(m, 'strike')
				m.underline = this.checkType(m, 'underline')
				m.inline = this.checkType(m, 'inline-code')
				m.multiline = this.checkType(m, 'multiline-code')
				m.tag = this.checkType(m, 'tag')
				m.image = this.checkImageType(m)
			})

			return message
		},
		formattedContent() {
			return this.formatTags(this.content)
		}
	},

	methods: {
		checkType(message, type) {
			return message.types.indexOf(type) !== -1
		},
		checkImageType(message) {
			let index = message.value.lastIndexOf('.')
			const slashIndex = message.value.lastIndexOf('/')
			if (slashIndex > index) index = -1

			const type = message.value.substring(index + 1, message.value.length)

			const isMedia =
				index > 0 && IMAGE_TYPES.some(t => type.toLowerCase().includes(t))

			if (isMedia) this.setImageSize(message)

			return isMedia
		},
		setImageSize(message) {
			const image = new Image()
			image.src = message.value

			image.addEventListener('load', onLoad)

			function onLoad(img) {
				const ratio = img.path[0].width / 150
				message.height = Math.round(img.path[0].height / ratio) + 'px'
				image.removeEventListener('load', onLoad)
			}
		},
		formatTags(content) {
			this.users.forEach(user => {
				const userTagRegex = new RegExp(`<usertag>${user._id}</usertag>`, 'g')
				content = content.replace(userTagRegex, `@${user.username}`)
			})

			return content
		},
		openTag(message) {
			if (!this.singleLine && this.checkType(message, 'tag')) {
				const user = this.users.find(
					u => message.value.indexOf(u.username) !== -1
				)
				this.$emit('open-user-tag', user)
			}
		}
	}
}
</script>

<style lang="scss">
.vac-format-message-wrapper {
	.vac-icon-deleted {
		height: 14px;
		width: 14px;
		vertical-align: middle;
		margin: -3px 1px 0 0;
		fill: var(--chat-room-color-message);
	}

	.vac-image-link-container {
		background-color: var(--chat-message-bg-color-media);
		padding: 8px;
		margin: 2px auto;
		border-radius: 4px;
	}

	.vac-image-link {
		position: relative;
		background-color: var(--chat-message-bg-color-image) !important;
		background-size: contain;
		background-position: center center !important;
		background-repeat: no-repeat !important;
		height: 150px;
		width: 150px;
		max-width: 100%;
		border-radius: 4px;
		margin: 0 auto;
	}

	.vac-image-link-message {
		max-width: 166px;
		font-size: 12px;
	}
}
</style>
