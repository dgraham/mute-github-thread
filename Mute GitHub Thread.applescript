# Split the <mailto:. . .>, <https://. . .> links in to a list.
on split(urls)
	set previous to AppleScript's text item delimiters
	set AppleScript's text item delimiters to {", "}
	set pieces to (every text item in urls) as list
	set AppleScript's text item delimiters to previous
	return pieces
end split

# Remove the < and > markers from the url.
on clean(_url)
	set _length to (get count of characters in _url)
	return text 2 thru (_length - 1) of _url
end clean

# Display notification banner.
on announce(_count)
	if _count is 1 then
		set _label to "conversation"
	else
		set _label to "conversations"
	end if
	set _text to (_count as text) & " " & _label & " muted."
	display notification _text with title "Thread Muted"
end announce

tell application "Mail"
	set _messages to selection
	repeat with _message in _messages
		set _headers to (headers of the _message whose name is "List-Unsubscribe")
		if length of _headers > 0 then
			set urls to content of item 1 of _headers
			set unsubscribe to item 2 of my split(urls)
			set cleaned to my clean(unsubscribe)
			tell current application to do shell script "curl " & cleaned & " &> /dev/null &"
		end if
	end repeat
	
	my announce(length of _messages)
end tell