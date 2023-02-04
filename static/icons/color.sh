#!/bin/bash

suffix="-dg"
color="#4c4878"

for file in $(fdfind ".*$suffix"); do
	echo $(cat $file | sed -E "s/fill=\".{7}\"/fill=\"$color\"/g" | sed -E "s/currentColor/$color/g") > $file
done
