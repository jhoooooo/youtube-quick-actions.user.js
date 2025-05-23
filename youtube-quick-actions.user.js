// ==UserScript==
// @name        YouTube Quick Actions
// @description Adds quick-action buttons like Hide, Save to Playlist, Not Interested, and Don’t Recommend
// @version     1.6.3
// @match       https://www.youtube.com/*
// @license     Unlicense
// @icon        https://www.youtube.com/s/desktop/c722ba88/img/logos/favicon_144x144.png
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @grant       GM_unregisterMenuCommand
// @compatible  firefox
// @namespace   https://greasyfork.org/users/1223791
// @downloadURL https://update.greasyfork.org/scripts/533514/YouTube%20Quick%20Actions.user.js
// @updateURL	https://update.greasyfork.org/scripts/533514/YouTube%20Quick%20Actions.meta.js
// ==/UserScript==

"use strict";

console.log("🫡 [Youtube Quick Actions] Script initialized");

const css = String.raw;
const style = css`
    :root {
        --color-primary: rgba(252, 146, 205, 1);
        --color-secondary: rgba(33, 225, 255, 1) ;
    }

	#quick-actions {
		position: absolute;
		display: none;
		flex-direction: column;
		gap: 0.2em;
		align-items: flex-start;
	}

	.location-01 {
		top: 0.8em;
		left: 0.8em;
	}

	.location-02 {
		top: 0.4em;
		left: 0.4em;
	}

	.qa-button {
		background-color: rgba(0, 0, 0, 0.9);
		/* box-shadow: inset 2px 3px 5px #000, 0px 0px 8px #d0d0d02e; */
		z-index: 1000;
		border: 1px solid #f0f0f05c;
		width: 26px;
		height: 26px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		font-size: 16px;
		font-weight: bold;
		border-radius: 4px;
		cursor: pointer;
		flex-shrink: unset;
	}

	.qa-button:hover {
		border: 1px solid rgba(255, 255, 255, 0.2);
		opacity: 0.9;
		background-color: rgba(55, 55, 55, 0.9);
	}

	.qa-icon {
		width: 1em;
		height: 1em;
		vertical-align: -0.125em;
	}

	YTD-RICH-ITEM-RENDERER:hover:not(:has(ytd-rich-grid-media[is-dismissed])):not(:has(.ytDismissibleItemReplacedContent)) #quick-actions,
	YTD-COMPACT-VIDEO-RENDERER:hover:not([is-dismissed]):not(:has(#dismissed-content)) #quick-actions,
	YTM-SHORTS-LOCKUP-VIEW-MODEL-V2:hover:not(:has(.ytDismissibleItemReplacedContent)) #quick-actions,
	YT-LOCKUP-VIEW-MODEL:hover:not(:has(.ytDismissibleItemReplacedContent)) #quick-actions,
	YTD-PLAYLIST-VIDEO-RENDERER:hover #quick-actions,
	YTD-VIDEO-RENDERER:hover #quick-actions,
	YTD-GRID-VIDEO-RENDERER:hover #quick-actions {
		display: flex;
	}

	/*
	#dismissible:hover:not(:has(ytm-shorts-lockup-view-model-v2)) > #quick-actions {
		display: flex;
	}
	*/

	YT-LOCKUP-VIEW-MODEL:hover:has(#quick-actions),
	YTD-PLAYLIST-VIDEO-RENDERER:hover:has(#quick-actions) {
		position: relative;
	}

    .fancy {
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-image: linear-gradient(
            45deg,
            var(--color-primary) 17%,
            var(--color-secondary) 100%
        );
        background-size: 400% auto;
        background-position: 0% 50%;
        animation: animate-gradient 12s linear infinite;
        font-weight: bold!important;
    }

    @keyframes animate-gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
`;

GM_addStyle(style);

/* -------------------------------------------------------------------------- */
/*                                  Variables                                 */
/* -------------------------------------------------------------------------- */

// Elem to search for
const normalVideoTagName = "YTD-RICH-ITEM-RENDERER";
const searchVideoTagName = "YTD-VIDEO-RENDERER";
const gridVideoTagName = "YTD-GRID-VIDEO-RENDERER";
const compactVideoTagName = "YTD-COMPACT-VIDEO-RENDERER";
const shortsV2VideoTagName = "YTM-SHORTS-LOCKUP-VIEW-MODEL-V2";
const shortsVideoTagName = "YTM-SHORTS-LOCKUP-VIEW-MODEL";
const compactPlaylistContainer = "YTD-ITEM-SECTION-RENDERER";
const compactPlaylistSelector = ".yt-lockup-view-model-wiz";
const playlistVideoTagName = "YT-LOCKUP-VIEW-MODEL";
const playlistVideoTagName2 = "YTD-PLAYLIST-VIDEO-RENDERER";
const memberVideoTagName = "YTD-MEMBERSHIP-BADGE-RENDERER";
const memberVideoSelector = ".badge-style-type-members-only";
const thumbnailElementSelector = "img.yt-core-image";
const normalHamburgerMenuSelector = "button#button.style-scope.yt-icon-button";
const shortsAndPlaylistHamburgerMenuSelector = "button.yt-spec-button-shape-next";
const dropdownMenuTagName = "TP-YT-IRON-DROPDOWN";
const popupMenuItemsSelector = "yt-formatted-string.style-scope.ytd-menu-service-item-renderer, yt-list-item-view-model[role='menuitem']";
//Menu Extractions / Properties Path
const searchMenuPropertyPath = "menu.menuRenderer.items";
const gridMenuPropertyPath = "menu.menuRenderer.items";
const shortsMenuPropertyPath = "content.shortsLockupViewModel.menuOnTap.innertubeCommand.showSheetCommand.panelLoadingStrategy.inlineContent.sheetViewModel.content.listViewModel.listItems";
const shortsV2MenuPropertyPath = "menuOnTap.innertubeCommand.showSheetCommand.panelLoadingStrategy.inlineContent.sheetViewModel.content.listViewModel.listItems";
const normalMenuPropertyPath = "content.videoRenderer.menu.menuRenderer.items";
const playlistMenuPropertyPath = "content.lockupViewModel.metadata.lockupMetadataViewModel.menuButton.buttonViewModel.onTap.innertubeCommand.showSheetCommand.panelLoadingStrategy.inlineContent.sheetViewModel.content.listViewModel.listItems";
const playlistMenuPropertyPath2 = "menu.menuRenderer.items";
const compactPlaylistMenuPropertyPath = "metadata.lockupMetadataViewModel.menuButton.buttonViewModel.onTap.innertubeCommand.showSheetCommand.panelLoadingStrategy.inlineContent.sheetViewModel.content.listViewModel.listItems";
const compactMenuPropertyPath = "menu.menuRenderer.items";
const membersOnlyMenuPropertyPath = "content.feedEntryRenderer.item.videoRenderer.menu.menuRenderer.items";
const membersOnlyMenuPropertyPath2 = "content.videoRenderer.menu.menuRenderer.items";
const availableMenuItemsList1 = "listItemViewModel?.title?.content";
const availableMenuItemsList2 = "menuServiceItemRenderer?.text?.runs?.[0]?.text";
const normalVideoRichThumbnailPath = "content?.videoRenderer?.richThumbnail?.movingThumbnailRenderer?.movingThumbnailDetails?.thumbnails?.[0]?.url";
const normalVideoThumbnailPath = "content?.videoRenderer?.thumbnail?.thumbnails";
const compactVideoRichThumbnailPath = "richThumbnail?.movingThumbnailRenderer?.movingThumbnailDetails?.thumbnails?.[0]?.url";
const compactVideoThumbnailPath = "thumbnail?.thumbnails";

// <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
const notInterestedIcon = `<svg class="qa-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM159.3 388.7c-2.6 8.4-11.6 13.2-20 10.5s-13.2-11.6-10.5-20C145.2 326.1 196.3 288 256 288s110.8 38.1 127.3 91.3c2.6 8.4-2.1 17.4-10.5 20s-17.4-2.1-20-10.5C340.5 349.4 302.1 320 256 320s-84.5 29.4-96.7 68.7zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>`;
const frownIcon = `<svg class="qa-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM176.4 176a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm-122 174.5c-12.4 5.2-26.5-4.1-21.1-16.4c16-36.6 52.4-62.1 94.8-62.1s78.8 25.6 94.8 62.1c5.4 12.3-8.7 21.6-21.1 16.4c-22.4-9.5-47.4-14.8-73.7-14.8s-51.3 5.3-73.7 14.8z"/></svg>`;
const saveIcon = `<svg class="qa-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M512 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l128 0c20.1 0 39.1 9.5 51.2 25.6l19.2 25.6c6 8.1 15.5 12.8 25.6 12.8l160 0c35.3 0 64 28.7 64 64l0 256zM232 376c0 13.3 10.7 24 24 24s24-10.7 24-24l0-64 64 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-64 0 0-64c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 64-64 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l64 0 0 64z"/></svg>`;
const dontRecommendChannelIcon = `<svg class="qa-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>`;
const hideIcon = `<svg class="qa-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"/></svg>`;
const pooIcon = `<svg class="qa-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M268.9 .9c-5.5-.7-11 1.4-14.5 5.7s-4.6 10.1-2.8 15.4c2.8 8.2 4.3 16.9 4.3 26.1c0 44.1-35.7 79.9-79.8 80L160 128c-35.3 0-64 28.7-64 64c0 19.1 8.4 36.3 21.7 48L104 240c-39.8 0-72 32.2-72 72c0 23.2 11 43.8 28 57c-34.1 5.7-60 35.3-60 71c0 39.8 32.2 72 72 72l368 0c39.8 0 72-32.2 72-72c0-35.7-25.9-65.3-60-71c17-13.2 28-33.8 28-57c0-39.8-32.2-72-72-72l-13.7 0c13.3-11.7 21.7-28.9 21.7-48c0-35.3-28.7-64-64-64l-5.5 0c3.5-10 5.5-20.8 5.5-32c0-48.6-36.2-88.8-83.1-95.1zM192 256a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm64 108.3c0 2.4-.7 4.8-2.2 6.7c-8.2 10.5-39.5 45-93.8 45s-85.6-34.6-93.8-45c-1.5-1.9-2.2-4.3-2.2-6.7c0-6.8 5.5-12.3 12.3-12.3l167.4 0c6.8 0 12.3 5.5 12.3 12.3z"/></svg>`;
const mehIcon = `<svg class="qa-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM176.4 176a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM160 336l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>`;
const trashIcon = `<svg class="qa-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/></svg>`;

/* -------------------------------------------------------------------------- */
/*                                  Functions                                 */
/* -------------------------------------------------------------------------- */

/* ----------------------------- Menu Commmands ----------------------------- */

let isLoggingEnabled = GM_getValue("isLoggingEnabled", false);
let optRichThumbnail = GM_getValue("optRichThumbnail", true);
const menuCommands = [
	{
		label: () => `Rich Thumbnail: ${optRichThumbnail ? "ON" : "OFF"}`,
		toggle: function toggleRichThumbnail()
		{
			optRichThumbnail = !optRichThumbnail;
			GM_setValue("optRichThumbnail", optRichThumbnail);
			updateMenuCommands();
			window.location.reload(true);
		},
		id: undefined,
	},
	{
		label: () => `Logging: ${isLoggingEnabled ? "ON" : "OFF"}`,
		toggle: function toggleLogging()
		{
			isLoggingEnabled = !isLoggingEnabled;
			GM_setValue("isLoggingEnabled", isLoggingEnabled);
			updateMenuCommands();
			window.location.reload(true);
		},
		id: undefined,
	}
];

function registerMenuCommands()
{
	for (const command of menuCommands)
	{
		command.id = GM_registerMenuCommand(command.label(), command.toggle);
	}
}

function updateMenuCommands()
{
	for (const command of menuCommands)
	{
		if (command.id)
		{
			GM_unregisterMenuCommand(command.id);
		}
		command.id = GM_registerMenuCommand(command.label(), command.toggle);
	}
}

function toggleRichThumbnail()
{
	optRichThumbnail = !optRichThumbnail;
	GM_setValue("toggle5050Endorsement", optRichThumbnail);
	updateMenuCommands();
	window.location.reload(true);
}

function toggleLogging()
{
	isLoggingEnabled = !isLoggingEnabled;
	GM_setValue("isLoggingEnabled", isLoggingEnabled);
	updateMenuCommands();
	window.location.reload(true);
}

registerMenuCommands();

/* ---------------------------- Menu Commands End --------------------------- */

function log(...args)
{
	if (isLoggingEnabled)
	{
		console.log(...args);
	}
}

function getByPathReduce(target, path)
{
	return path.split('.').reduce((result, key) => result?.[key], target) ?? [];
}

//Same result as getByPathReduce()
function getByPathFunction(object, path)
{
	try
	{
		return new Function('object', `return object.${path}`)(object) ?? [];
	} catch
	{
		return [];
	}
}

function getDataProperty(origin, videoType)
{
	const childQuerySelectors = {
		"shorts-v2": shortsVideoTagName,
		"compact-playlist": compactPlaylistSelector,
	};
	const selector = childQuerySelectors[videoType];
	const target = selector ? origin.querySelector(selector) : origin;
	return target?.data;
}

function getMenuList(target)
{
	return target.map(item =>
	{
		const first = getByPathFunction(item, availableMenuItemsList1);
		if (first.length) return first;

		const second = getByPathFunction(item, availableMenuItemsList2);
		if (second.length) return second;

		return null;
	}).filter(Boolean);
}

function findElemInParentDomTree(originElem, targetSelector)
{
	log(`🔍 Starting search from:`, originElem);

	let node = originElem;
	while (node)
	{
		log(`👆 Checking ancestor:`, node);
		const found = Array.from(node.children).find(
			(child) => child.matches(targetSelector) || child.querySelector(targetSelector)
		);

		if (found)
		{
			const result = found.matches(targetSelector) ? found : found.querySelector(targetSelector);
			log(`✅ Found target:`, result);
			return result;
		}

		node = node.parentElement;
	}

	log("⚠️ No matching element found.");
	return null;
}

function getVisibleElem(targetSelector)
{
	const elements = document.querySelectorAll(targetSelector);
	for (const element of elements)
	{
		const rect = element.getBoundingClientRect();
		if (element.offsetParent !== null && rect.width > 0 && rect.height > 0)
		{
			log("👀 Menu is visible and ready:", element);
			return element;
		}
	}
	log("⚠️ No visible menu found.");
	return null;
}

async function waitUntil(conditionFunction, { interval = 100, timeout = 3000 } = {})
{
	const startTime = Date.now();
	while (Date.now() - startTime < timeout)
	{
		const result = conditionFunction();
		if (result) return result;
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
	throw new Error("⏰ Timeout: Target element is not visible in time");
}

function retryClick(element, { maxAttempts = 5, interval = 300 } = {})
{
	return new Promise((resolve) =>
	{
		let attempts = 0;

		function tryClick()
		{
			if (!element || attempts >= maxAttempts)
			{
				log("⚠️ Retry failed or element missing.");
				return resolve();
			}

			const rect = element.getBoundingClientRect();
			const isVisible = rect.width > 0 && rect.height > 0;

			if (isVisible)
			{
				element.dispatchEvent(
					new MouseEvent("click", {
						view: document.defaultView,
						bubbles: true,
						cancelable: true,
					}),
				);
				log("👇 Clicked matching menu item");
				return resolve();
			} else
			{
				attempts++;
				setTimeout(tryClick, interval);
			}
		}

		tryClick();
	});
}

function appendButtons(element, menuItems, type, position)
{
	let className, titleText, icon;
	let buttonsToAppend = [];

	const finalMenuItems = [...new Set(menuItems)];

	//If menu is empty, proceed and still append the container to prevent looping of menu data probe.
	//Probe will only skip if #quick-action exist.

	for (const item of finalMenuItems)
	{
		if (!item) continue;

		let className;
		let titleText;
		let icon;

		if (item.startsWith("Remove from "))
		{
			className = "remove";
			titleText = "Remove from playlist";
			icon = trashIcon;
		} else
		{
			switch (item)
			{
				case "Not interested":
					className = "not_interested";
					titleText = "Not interested";
					icon = notInterestedIcon;
					break;
				case "Don't recommend channel":
					className = "dont_recommend_channel";
					titleText = "Don't recommend channel";
					icon = dontRecommendChannelIcon;
					break;
				case "Hide":
					className = "hide";
					titleText = "Hide video";
					icon = hideIcon;
					break;
				case "Save to playlist":
					className = "save";
					titleText = "Save to playlist";
					icon = saveIcon;
					break;
				default:
					continue;
			}
		}

		buttonsToAppend.push(
			`<button class="qa-button ${className}" data-icon="${className}" title="${titleText}" data-text="${titleText}">${icon}</button>`,
		);
	}

	const buttonsContainer = document.createElement("div");
	buttonsContainer.id = "quick-actions";
	buttonsContainer.classList.add(position, type);
	buttonsContainer.innerHTML = buttonsToAppend.join("");

	//element.insertAdjacentElement("afterend", buttonsContainer);
	const exist = element.querySelector("#quick-actions");
	if (exist) return;
	element.insertAdjacentElement("beforeend", buttonsContainer);
}

function onPageChange(callback)
{
	const listenerMap = new Map();
	['pushState', 'replaceState'].forEach(method =>
	{
		const original = history[method];
		const wrapped = function (...args)
		{
			const result = original.apply(this, args);
			window.dispatchEvent(new Event('spa-route-change'));
			return result;
		};

		history[method] = wrapped;
		listenerMap.set(method, original);
	});

	const onSpaRouteChange = () => callback('spa', window.location.href);
	const onPopState = () => window.dispatchEvent(new Event('spa-route-change'));
	const onYtAction = (event) =>
	{
		const actionName = event?.detail?.actionName;
		if (actionName === 'yt-history-pop' || actionName === 'yt-navigate')
		{
			callback('yt', window.location.href);
		}
	};

	window.addEventListener('spa-route-change', onSpaRouteChange);
	window.addEventListener('popstate', onPopState);
	document.addEventListener('yt-action', onYtAction);

	return function cleanup()
	{
		for (const [method, original] of listenerMap.entries())
		{
			history[method] = original;
		}

		window.removeEventListener('spa-route-change', onSpaRouteChange);
		window.removeEventListener('popstate', onPopState);
		document.removeEventListener('yt-action', onYtAction);
	};
}

/* -------------------------------------------------------------------------- */
/*                                  Listeners                                 */
/* -------------------------------------------------------------------------- */

// Remove all existing quick-action elements. On certain pages, like channel tabs, content is updated in-place
// without removing the grid/container. If not cleared, old quick-action buttons will remain attached to unrelated items.
// This ensures that if the content is updated, new hover actions will fetch fresh, relevant data.
// I have not take a closer look at yt-made events. propably have some things we can customized and fire to speed things up
// skip querying and fired the action straight up via their internal events

let richThumbnailDisabler = new Date(Date.now() + 360 * 60 * 1000);

onPageChange((source, url) =>
{
	richThumbnailDisabler = new Date(Date.now() + 360 * 60 * 1000);
});

document.addEventListener("yt-action", (event) =>
{
	if (event.detail.actionName === "ytd-update-grid-state-action")
	{
		log("🐛 Page updated.");
		document.querySelectorAll("#quick-actions").forEach((element) => element.remove());
	}
});

let opThumbnail, riThumbnail;
document.addEventListener("mouseover", (event) =>
{
	const path = event.composedPath();
	for (let element of path)
	{
		if (
			(element.tagName === normalVideoTagName ||
				element.tagName === compactVideoTagName ||
				element.tagName === shortsV2VideoTagName ||
				element.tagName === searchVideoTagName ||
				element.tagName === gridVideoTagName ||
				element.tagName === playlistVideoTagName ||
				element.tagName === playlistVideoTagName2) &&
			!element.querySelector("#quick-actions")
		)
		{
			let type, data;

			// Determine element type
			// Hierarchy might need tweaking to simplify detection. nah this whole listener block,
			// cause i'm already confused which tag is needed for which video, what need extra query, then which path
			// and specific video type wont get shown unless specific step is done, even then rarely replicable to debug
			// some of this type no longer valid as i go, cause i can't keep track no more
			if (element.tagName === shortsV2VideoTagName)
			{
				type = "shorts-v2";
			}
			else if (element.tagName === playlistVideoTagName && element.parentElement.parentElement.tagName === compactPlaylistContainer)
			{
				type = "compact-playlist";
			}
			else if (element.tagName === gridVideoTagName)
			{
				type = "grid-video";
			}
			else if (element.tagName === searchVideoTagName)
			{
				type = "search-video";
			}
			else if (element.tagName === playlistVideoTagName && element.parentElement.parentElement.tagName === normalVideoTagName)
			{
				//hover listener will land on playlistVideoTagName instead of normalVideoTagName for playlist/mixes on homepage
				//so manually change back to normalVideoTagName as data is there.
				element = element.parentElement.parentElement;
				if (element.querySelector("#quick-actions")) return;
				type = "playlist";
			}
			else if (element.tagName === playlistVideoTagName2)
			{
				type = "playlist2";
			}
			else
			{
				const isShort = element.querySelector(shortsVideoTagName) !== null;
				const isPlaylist = element.querySelector(playlistVideoTagName) !== null;
				const isMemberOnly =
					element.querySelector(memberVideoTagName) !== null ||
					element.querySelector(memberVideoSelector) !== null;

				type = isShort ? "shorts" :
					element.tagName === compactVideoTagName ? "compact" :
						isPlaylist ? "collection" :
							isMemberOnly ? "members_only" :
								"normal";
			}

			log("⭐ Video Elem: ", element.tagName, element);
			log("ℹ️ Video Type: ", type);

			data = getDataProperty(element, type);
			const thumbnailElement = element.querySelector(thumbnailElementSelector);
			const thumbnailSize =
				thumbnailElement?.getClientRects?.().length > 0
					? parseInt(thumbnailElement.getClientRects()[0].width)
					: 100;
			log("🖼️ Thumbnail Size: ", thumbnailSize);
			const containerPosition = thumbnailSize < 211 ? "location-02" : "location-01";

			if (!data)
			{
				log("⚠️ No props data found.");
				return;
			}

			log("🎥 Video Props: ", data);

			let menulist;
			switch (type)
			{
				case "normal":
					menulist = getByPathFunction(data, normalMenuPropertyPath);
					break;
				case "search-video":
					menulist = getByPathFunction(data, searchMenuPropertyPath);
					break;
				case "grid-video":
					menulist = getByPathFunction(data, gridMenuPropertyPath);
					break;
				case "shorts":
					menulist = getByPathFunction(data, shortsMenuPropertyPath);
					break;
				case "shorts-v2":
					menulist = getByPathFunction(data, shortsV2MenuPropertyPath);
					break;
				case "compact":
					menulist = getByPathFunction(data, compactMenuPropertyPath);
					break;
				case "collection":
					menulist = getByPathFunction(data, playlistMenuPropertyPath);
					break;
				case "playlist":
					menulist = getByPathFunction(data, playlistMenuPropertyPath);
					break;
				case "playlist2":
					menulist = getByPathFunction(data, playlistMenuPropertyPath2);
					break;
				case "compact-playlist":
					menulist = getByPathFunction(data, compactPlaylistMenuPropertyPath);
					break;
				case "members_only":
					menulist = getByPathFunction(data, membersOnlyMenuPropertyPath);
					if (!menulist.length)
					{
						menulist = getByPathFunction(data, membersOnlyMenuPropertyPath2);
					}
					break;
				default:
					menulist = getByPathFunction(data, normalMenuPropertyPath);
					break;
			}

			const menulistItems = getMenuList(menulist);
			log("📃 Menu items: ", menulistItems);
			appendButtons(element, menulistItems, type, containerPosition);

			//Rich Thumbnails
			//Rich thumbnail is hardcoded on dataset and expired after 6 hours therefore 
			//we'll disable it after 6 hours from page first loaded.
			//on error check is also added to prevent gray default to be added if rich thumbnail is expired
			if (optRichThumbnail && Date.now() < richThumbnailDisabler)
			{
				log("📸 Rich Thumbnails: ", Date.now() < richThumbnailDisabler);
				let hoverToken = null;
				const mouseOverHandler = async (event) =>
				{
					const token = Symbol();
					hoverToken = token;

					const currentThumbnail = element.querySelector("img.yt-core-image");
					const thumbailData = getDataProperty(element, type);
					const normalRichThumbnail = getByPathFunction(thumbailData, normalVideoRichThumbnailPath);
					const compactRichThumbnail = getByPathFunction(thumbailData, compactVideoRichThumbnailPath);
					const richThumbnail =
						(typeof normalRichThumbnail === 'string' && normalRichThumbnail) ||
						(typeof compactRichThumbnail === 'string' && compactRichThumbnail) ||
						undefined;

					function isImageValid(url)
					{
						return new Promise((resolve) =>
						{
							const img = new Image();
							img.onload = () => resolve(true);
							img.onerror = () => resolve(false);
							img.src = url;
						});
					}

					const isValid = await isImageValid(richThumbnail);

					if (richThumbnail && isValid && hoverToken === token)
					{
						currentThumbnail.src = richThumbnail;
					}
				};

				const mouseOutHandler = (event) =>
				{
					hoverToken = null;
					const currentThumbnail = element.querySelector("img.yt-core-image");
					const thumbnailData = getDataProperty(element, type);
					const normalThumbnails = getByPathFunction(thumbnailData, normalVideoThumbnailPath);
					const compactThumbnails = getByPathFunction(thumbnailData, compactVideoThumbnailPath);
					const biggestNormalThumbnail = normalThumbnails.at(-1)?.url;
					const biggestCompactThumbnail = compactThumbnails.at(-1)?.url;
					const staticThumbnail = biggestNormalThumbnail || biggestCompactThumbnail;

					if (staticThumbnail)
					{
						currentThumbnail.src = staticThumbnail;
					}
				};

				element.addEventListener("mouseenter", mouseOverHandler, true);
				element.addEventListener("mouseleave", mouseOutHandler, true);

				setTimeout(() =>
				{
					element.removeEventListener("mouseover", mouseOverHandler, true);
					element.removeEventListener("mouseout", mouseOutHandler, true);
					log("📸 Rich Thumbnails: disabled after timeout");
				}, richThumbnailDisabler - Date.now());
			}
		}
	}
}, true);

document.addEventListener("click", async function (event)
{
	const button = event.target.closest(".qa-button");
	if (!button) return;

	event.stopPropagation();
	event.stopImmediatePropagation();
	event.preventDefault();

	const actionType = button.dataset.icon;
	let response;

	switch (actionType)
	{
		case "not_interested":
			response = "Not interested";
			log("😴 Marking as not interested");
			break;
		case "dont_recommend_channel":
			response = "Don't recommend channel";
			log("🚫 Don't recommend channel");
			break;
		case "hide":
			response = "Hide";
			log("🗑️ Hiding video");
			break;
		case "remove":
			response = "Remove from";
			log("🗑️ Remove from playlist");
			break;
		case "save":
			response = "Save to playlist";
			log("📂 Saving to playlist");
			break;
		default:
			log("☠️ Unknown action");
	}

	let menupath;

	if (button.parentElement.parentElement.tagName === shortsV2VideoTagName || button.parentElement.parentElement.querySelector(playlistVideoTagName))
	{
		menupath = shortsAndPlaylistHamburgerMenuSelector;
	}
	else if (button.parentElement.classList.contains("shorts"))
	{
		//shorts but not inside shortsv2 container idk where i found this its gone now crazy i was crazy once
		//been a while, probably safe to remove now.
		alert("shorts!");
		menupath = shortsAndPlaylistHamburgerMenuSelector;
	}
	else if (button.parentElement.classList.contains("compact-playlist"))
	{
		menupath = shortsAndPlaylistHamburgerMenuSelector;
	}
	else
	{
		menupath = normalHamburgerMenuSelector;
	}

	const menus = findElemInParentDomTree(button, menupath);
	if (!menus)
	{
		log("❌ Menu button not found.");
		return;
	}

	menus.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	log("👇 Button clicked, waiting for menu...");

	try
	{
		const visibleMenu = await waitUntil(() => getVisibleElem(dropdownMenuTagName), {
			interval: 100,
			timeout: 3000,
		});
		if (visibleMenu)
		{
			try
			{
				const targetItem = await waitUntil(
					() =>
					{
						const items = visibleMenu.querySelectorAll(popupMenuItemsSelector);
						return items.length > 0 ? items : null;
					},
					{
						interval: 100,
						timeout: 5000,
					},
				);

				if (targetItem)
				{
					log("🎉 Target items found:", targetItem);

					for (const item of targetItem)
					{
						if (
							item.textContent === response ||
							(response === "Remove from" && item.textContent.startsWith("Remove from"))
						)
						{
							log(`✅ Matched: (${response} = ${item.textContent})`);
							log(`✅`, item);

							const button = item;
							await retryClick(button, { maxAttempts: 5, interval: 300 }).finally(() =>
							{
								document.body.click();
							});
							break;
						} else
						{
							log(`❌ Not a match: (${response} = ${item.textContent})`);
						}
					}
				}
			} catch (error)
			{
				log("🛑 !", error.message);
				//document.body.click()
			}
		}

		//setTimeout(() => document.body.click(), 200);
	} catch (error)
	{
		log("🛑 !!", error.message);
		//document.body.click()
	}
});

/* -------------------------------------------------------------------------- */
/*         This script is brought to you in support of FIFTY FIFTY 💖         */
/* -------------------------------------------------------------------------- */

if ("💖")
{
	const selectorsToWatch = ['a', 'yt-formatted-string'];
	const observedElements = new WeakMap();

	function observeTextContentChanges(element)
	{
		if (observedElements.has(element)) return;

		const elementObserver = new MutationObserver(() =>
		{
			const hasText = element.textContent.trim() === "FIFTY FIFTY Official";
			element.classList.toggle("fancy", hasText);
		});

		observedElements.set(element, elementObserver);
		elementObserver.observe(element, { characterData: true, childList: true, subtree: true });
	}

	document.querySelectorAll(selectorsToWatch.join(',')).forEach(element =>
	{
		if (element.textContent.trim() === "FIFTY FIFTY Official") element.classList.add("fancy");
		observeTextContentChanges(element);
	});

	const observer = new MutationObserver((mutations) =>
	{
		for (const mutation of mutations)
		{
			for (const node of mutation.addedNodes)
			{
				if (node.nodeType !== 1) continue;

				for (const selector of selectorsToWatch)
				{
					const elements = node.matches(selector) ? [node] : node.querySelectorAll(selector);
					elements.forEach(element =>
					{
						if (element.textContent.trim() === "FIFTY FIFTY Official") element.classList.add("fancy");
						observeTextContentChanges(element);
					});
				}
			}

			for (const node of mutation.removedNodes)
			{
				if (node.nodeType === 1 && observedElements.has(node))
				{
					observedElements.get(node).disconnect();
					observedElements.delete(node);
				}
			}
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });
}
