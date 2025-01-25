(function CubeEntity() {
    ModAPI.meta.title("Cube Entity");
    ModAPI.meta.version("v0");
    ModAPI.meta.description("testing custom entities");
    ModAPI.meta.credits("By ZXMushroom64");

    function registerEntity() {
        // Utils
        const ResourceLocation = ModAPI.reflect.getClassByName("ResourceLocation").constructors.find(x=>x.length===1);
        const GlStateManager = Object.fromEntries(Object.values(ModAPI.reflect.getClassByName("GlStateManager").staticMethods).map(x=>[x.methodNameShort, x.method]));

        // START CUSTOM ENTITY
        var entityClass = ModAPI.reflect.getClassById("net.minecraft.entity.Entity");
        var entitySuper = ModAPI.reflect.getSuper(entityClass, (x) => x.length === 2);
        var nme_EntityCube = function nme_EntityCube($worldIn) {
            entitySuper(this, $worldIn);
            this.$setCreativeTab(creativeMiscTab);
            this.$preventEntitySpawning = 1;
            this.$setSize(1, 1);
        }
        ModAPI.reflect.prototypeStack(entityClass, nme_EntityCube);
        nme_EntityCube.prototype.$canTriggerWalking = function () { return 0 };
        nme_EntityCube.prototype.$canBePushed = function () { return 0 };
        nme_EntityCube.prototype.$getCollisionBox = function () { return this.$getEntityBoundingBox() };
        nme_EntityCube.prototype.$getCollisionBoundingBox = function () { return this.$getEntityBoundingBox() };
        nme_EntityCube.prototype.$entityInit = function () { console.log("Cube entity created!") }; // Needed, is an abstract method in parent class
        // END CUSTOM ENTITY


        // START CUSTOM MODEL
        var ModelRenderer = ModAPI.reflect.getClassById("net.minecraft.client.model.ModelRenderer").constructors.find(x => x.length === 1);
        var modelBaseClass = ModAPI.reflect.getClassById("net.minecraft.client.model.ModelBase");
        var modelBaseSuper = ModAPI.reflect.getSuper(modelBaseClass); //while super isn't used when extending this class, java implies the call.
        var nmcm_ModelCube = function nmcm_ModelCube() {
            modelBaseSuper(this);
            this.$textureWidth = 64;
            this.$textureHeight = 64;
            this.$cubeRenderer = ModelRenderer(this).$setTextureOffset(0, 0);
            this.$cubeRenderer.$addBox0(0, 0, 0, 1, 1, 1);
            this.$cubeRenderer.$setRotationPoint(0, 0, 0);
        }
        ModAPI.reflect.prototypeStack(modelBaseClass, nmcm_ModelCube);
        nmcm_ModelCube.prototype.$render = function ($entity, useless1, useless2, partialTicks, useless3, useless4, f) {
            this.$cubeRenderer.$render(f);
        }
        // END CUSTOM MODEL


        // START CUSTOM RENDERER
        var renderClass = ModAPI.reflect.getClassById("net.minecraft.client.renderer.entity.Render");
        var renderSuper = ModAPI.reflect.getSuper(renderClass, (x)=>x.length === 2);
        const cubeTextures = ResourceLocation(ModAPI.util.str("textures/entity/cube.png"));
        var nmcre_RenderCube = function nmcre_RenderCube(renderManager) {
            renderSuper(this, renderManager);
            this.$modelCube = new nmcm_ModelCube();
            this.$shadowSize = 0.5;
        }
        ModAPI.reflect.prototypeStack(renderClass, nmcre_RenderCube);
        nmcre_RenderCube.prototype.$getEntityTexture = function (entity) {
            return cubeTextures;
        }
        const parentDoRender = nmcre_RenderCube.prototype.$doRender;
        nmcre_RenderCube.prototype.$doRender = function (entity, x, y, z, yaw, pitch) {
            GlStateManager.pushMatrix();
            GlStateManager.translate(x, y + 0.25, z);
            GlStateManager.rotate(180 - yaw, 0, 1, 0);
            this.$bindEntityTexture(entity);
            this.$modelCube.$render(entity, 0, 0, -0.1, 0, 0, 0.0625);
            GlStateManager.popMatrix();
            parentDoRender.apply(this, [entity, x, y, z, yaw, pitch]);
        }

        ModAPI.reflect.getClassById("net.minecraft.entity.EntityList").staticMethods.addMapping0.method(
            ModAPI.util.asClass(nme_EntityCube),
            {
                $createEntity: function ($worldIn) {
                    return new nme_EntityCube($worldIn);
                }
            },
            ModAPI.util.str("Cube"),
            ModAPI.keygen.entity("cube"),
            0x000000, //egg base
            0x00FF00 //egg spots
        );
        

        return {
            EntityCube: nme_EntityCube,
            ModelCube: nmcm_ModelCube,
            RenderCube: nmcre_RenderCube,
            cubeTexture: cubeTextures
        }
    }

    ModAPI.dedicatedServer.appendCode(registerEntity);
    var data = registerEntity();

    ModAPI.addEventListener("lib:asyncsink", async () => {
        AsyncSink.L10N.set("entity.Cube.name", "Cube (TM)");
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/textures/entity/cube.png", await (await fetch(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAQBJREFUeF7l0BFzAmAAgOGvKxgMgiAYDIJgEARBEASDQTAIgiAYBEEQBN0NBkEQBEEQBIMgCAZBEAwGgyAIgiAIgiConxE88PJ790RCCNdYCOGeRe/4j4SYDvCgAzzqAHEdIKEDJHWAJx3gWQdI6QBpHeBFB8joAFkdIKcD5HWAgg5Q1AFedYA3HaCkA7zrAGUdoKIDVHWAmg7woQPUdYCGDtDUAVo6QFsH6OgAnzrAlw7Q1QF6OkBfBxjoAEMdYKQDjHWAiQ7wrQNMdYCZDjDXAX50gIUOsNQBVjrArw7wpwP86wBrHWCjA2x1gJ0OsNcBDjrAUQc46QBnHeBiA9wALSueIjTE4PwAAAAASUVORK5CYII="
        )).arrayBuffer());
        
        ModAPI.mc.renderManager.entityRenderMap.put(ModAPI.util.asClass(data.EntityCube), new data.RenderCube(ModAPI.mc.renderManager.getRef()));
    });
})();