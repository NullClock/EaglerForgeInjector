class PatchesRegistry {
    static patchFns = []
    static patchedEventNames = []
    static getEventInjectorCode() {
        return "globalThis.modapi_specialevents = [" + PatchesRegistry.patchedEventNames.flatMap(x=>`\`${x}\``).join(",") + "];";
    }
    static patchFile(x) {
        var current = x;
        PatchesRegistry.patchFns.forEach(fn => {
            current = fn(current);
        });
        return current;
    }
    static addPatch(fn) {
        PatchesRegistry.patchFns.push(fn);
    }
    static regSpecialEvent(x) {
        PatchesRegistry.patchedEventNames.push(x);
    }
}
// PatchesRegistry.regSpecialEvent("test");
// PatchesRegistry.addPatch(function (input) {
//     var output = input;
//     return output;
// })

PatchesRegistry.regSpecialEvent("render");
PatchesRegistry.addPatch(function (input) {
    var output = input.replaceAll(
        /\$tmp = \$entity.\$getEyeHeight\(\);\s+?if \(\$rt_suspending\(\)\) {/gm
        ,
`$tmp = $entity.$getEyeHeight();
            ModAPI.events.callEvent("render",{partialTicks:$partialTicks})
            if ($rt_suspending()) {`
    );
    return output;
})
