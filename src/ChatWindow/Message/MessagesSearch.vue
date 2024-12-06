<template>
	<div class="vac-box-messages-search">
		<div class="vac-icon-search">
			<slot name="search-icon">
				<svg-icon name="search" />
			</slot>
		</div>
		<input
			type="search"
			placeholder="Search"
			autocomplete="off"
			class="vac-input"
			@input="$emit('search-message', $event)"
		/>
	</div>
</template>

<script>
import SvgIcon from '../../components/SvgIcon'

export default {
	name: 'MessagesSearch',
	components: { SvgIcon }
}
</script>

<style lang="scss">
.vac-box-messages-search {
	position: sticky;
	display: flex;
	align-items: center;
	height: 54px;
	padding: 0 0 0 15px;
	border-bottom: var(--chat-border-style);

	.vac-icon-search {
		display: flex;
		position: absolute;
		left: 30px;

		svg {
			width: 18px;
			height: 18px;
		}
	}

	.vac-input {
		height: 30px;
		width: 100%;
		background: var(--chat-search-color);
		color: var(--chat-color);
		border-radius: 4px;
		font-size: 15px;
		outline: 0;
		caret-color: var(--chat-color-caret);
		padding: 10px 10px 10px 40px;
		border: 0.5px solid var(--chat-sidemenu-border-color-search);
		border-radius: 20px;

		&::placeholder {
			color: var(--chat-color-placeholder);
		}
	}

	@media only screen and (max-width: 768px) {
		height: 58px;
	}
}
</style>
